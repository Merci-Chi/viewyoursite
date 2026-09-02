import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import type { OnlineUser, TypingIndicator, CursorPosition, WebSocketMessage } from "@shared/schema";
import { insertChannelSchema } from "@shared/schema";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";

interface ConnectedClient {
  ws: WebSocket;
  user: OnlineUser;
  channelId: string;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: "/ws",
    maxPayload: 50 * 1024 * 1024  // 50MB max payload for media
  });
  const clients = new Map<string, ConnectedClient>();
  const typingIndicators = new Map<string, TypingIndicator>();
  const cursors = new Map<string, CursorPosition>();

  function broadcastAll(message: WebSocketMessage) {
    const messageStr = JSON.stringify(message);
    wss.clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(messageStr);
      }
    });
  }

  function broadcast(message: WebSocketMessage, excludeUserId?: string) {
    const messageStr = JSON.stringify(message);
    clients.forEach((client, id) => {
      if (client.ws.readyState === WebSocket.OPEN && id !== excludeUserId) {
        client.ws.send(messageStr);
      }
    });
  }

  function broadcastToChannel(channelId: string, message: WebSocketMessage, excludeUserId?: string) {
    const messageStr = JSON.stringify(message);
    clients.forEach((client, id) => {
      if (
        client.ws.readyState === WebSocket.OPEN &&
        client.channelId === channelId &&
        id !== excludeUserId
      ) {
        client.ws.send(messageStr);
      }
    });
  }

  function getOnlineUsers(): OnlineUser[] {
    return Array.from(clients.values()).map((c) => c.user);
  }

  function getOnlineUsersInChannel(channelId: string): OnlineUser[] {
    return Array.from(clients.values())
      .filter((c) => c.channelId === channelId)
      .map((c) => c.user);
  }

  async function notifyChannelPresence(channelId: string) {
    broadcastToChannel(channelId, {
      type: "presence_update",
      users: getOnlineUsersInChannel(channelId),
    });
  }

  async function broadcastChannelList() {
    const channels = await storage.getChannels();
    broadcastAll({ type: "channels", channels });
  }

  wss.on("connection", (ws) => {
    let currentUserId: string | null = null;

    storage.getChannels().then((channels) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "channels", channels }));
      }
    });

    ws.on("message", async (data) => {
      try {
        const message = JSON.parse(data.toString());

        switch (message.type) {
          case "join": {
            const { user, channelId } = message;
            if (!user?.id || !channelId) {
              ws.send(JSON.stringify({ type: "error", message: "Missing user or group." }));
              break;
            }

            const channel = await storage.getChannel(channelId);
            if (!channel) {
              ws.send(JSON.stringify({
                type: "error",
                message: "This group doesn't exist.",
              }));
              break;
            }

            const previous = currentUserId ? clients.get(currentUserId) : undefined;
            const previousChannelId = previous?.channelId;

            currentUserId = user.id;
            clients.set(user.id, { ws, user, channelId });

            if (previousChannelId && previousChannelId !== channelId) {
              typingIndicators.delete(user.id);
              broadcastToChannel(previousChannelId, { type: "leave", userId: user.id });
              await notifyChannelPresence(previousChannelId);
            }

            broadcastToChannel(channelId, { type: "join", user, channelId }, user.id);

            const channels = await storage.getChannels();
            ws.send(JSON.stringify({ type: "channels", channels }));

            const messages = await storage.getMessages(channelId);
            const messagesWithUsers = messages.map((m) => ({
              ...m,
              user: {
                id: m.userId,
                username: m.userUsername,
                displayName: m.userDisplayName,
                avatarColor: m.userAvatarColor,
                isTyping: false,
                typingContent: "",
              },
            }));
            ws.send(JSON.stringify({ type: "history", messages: messagesWithUsers }));

            await notifyChannelPresence(channelId);

            typingIndicators.forEach((indicator) => {
              if (indicator.channelId === channelId && indicator.userId !== user.id) {
                ws.send(JSON.stringify({ type: "typing", indicator }));
              }
            });

            break;
          }

          case "leave": {
            const { userId } = message;
            const leaving = clients.get(userId);
            const channelId = leaving?.channelId;
            clients.delete(userId);
            typingIndicators.delete(userId);
            cursors.delete(userId);
            if (currentUserId === userId) {
              currentUserId = null;
            }
            if (channelId) {
              broadcastToChannel(channelId, { type: "leave", userId });
              await notifyChannelPresence(channelId);
            }
            break;
          }

          case "message": {
            const { content, channelId, userId } = message;
            const client = clients.get(userId);
            
            if (client && client.channelId === channelId) {
              const newMessage = await storage.createMessage({
                channelId,
                userId,
                content,
              }, client.user);

              typingIndicators.delete(userId);

              broadcastToChannel(channelId, {
                type: "message",
                message: { ...newMessage, user: client.user },
              });
            }
            break;
          }

          case "typing": {
            const { indicator } = message;
            typingIndicators.set(indicator.userId, indicator);

            const client = clients.get(indicator.userId);
            if (client) {
              client.user.isTyping = true;
              client.user.typingContent = indicator.content;
            }

            broadcastToChannel(
              indicator.channelId,
              { type: "typing", indicator },
              indicator.userId
            );
            break;
          }

          case "typing_stop": {
            const { userId, channelId } = message;
            typingIndicators.delete(userId);

            const client = clients.get(userId);
            if (client) {
              client.user.isTyping = false;
              client.user.typingContent = "";
            }

            broadcastToChannel(
              channelId,
              { type: "typing_stop", userId, channelId },
              userId
            );
            break;
          }

          case "document_update": {
            const { documentId, content, userId } = message;
            await storage.updateDocument(documentId, content);
            
            broadcast(
              { type: "document_update", documentId, content, userId },
              userId
            );
            break;
          }

          case "cursor_update": {
            const { cursor } = message;
            cursors.set(cursor.userId, cursor);
            broadcast({ type: "cursor_update", cursor }, cursor.userId);
            break;
          }

          case "get_history": {
            const { channelId } = message;
            const existing = await storage.getChannel(channelId);
            if (!existing) {
              ws.send(JSON.stringify({ type: "error", message: "This group doesn't exist." }));
              break;
            }
            const messages = await storage.getMessages(channelId);
            const messagesWithUsers = messages.map((m) => ({
              ...m,
              user: {
                id: m.userId,
                username: m.userUsername,
                displayName: m.userDisplayName,
                avatarColor: m.userAvatarColor,
                isTyping: false,
                typingContent: "",
              },
            }));
            ws.send(JSON.stringify({ type: "history", messages: messagesWithUsers }));
            break;
          }

          case "get_document": {
            const { documentId } = message;
            const document = await storage.getDocument(documentId);
            if (document) {
              ws.send(JSON.stringify({ type: "document", document }));
            }
            break;
          }

          case "media": {
            const { media } = message;
            if (media && media.channelId) {
              console.log(`Broadcasting media: ${media.type} "${media.fileName}" to channel ${media.channelId}, URL length: ${media.url?.length || 0}`);
              broadcastToChannel(media.channelId, { type: "media", media }, media.userId);
            }
            break;
          }

          case "create_channel": {
            const parsed = insertChannelSchema.safeParse(message.channel ?? message);
            if (!parsed.success) {
              ws.send(JSON.stringify({ type: "error", message: "Name is required." }));
              break;
            }
            const name = parsed.data.name.trim();
            if (!name) {
              ws.send(JSON.stringify({ type: "error", message: "Name is required." }));
              break;
            }
            const channel = await storage.createChannel({
              name,
              description: parsed.data.description?.trim() || undefined,
            });
            await broadcastChannelList();
            ws.send(JSON.stringify({ type: "channel_created", channel }));
            break;
          }
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
        ws.send(JSON.stringify({ type: "error", message: "Invalid message format" }));
      }
    });

    ws.on("close", () => {
      if (currentUserId) {
        const leaving = clients.get(currentUserId);
        const channelId = leaving?.channelId;
        clients.delete(currentUserId);
        typingIndicators.delete(currentUserId);
        cursors.delete(currentUserId);
        if (channelId) {
          broadcastToChannel(channelId, { type: "leave", userId: currentUserId });
          notifyChannelPresence(channelId);
        }
      }
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  });

  app.get("/api/channels", async (req, res) => {
    const channels = await storage.getChannels();
    res.json(channels);
  });

  app.post("/api/channels", async (req, res) => {
    const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
    if (!name) {
      return res.status(400).json({ error: "Name is required." });
    }
    const description = typeof req.body?.description === "string"
      ? req.body.description.trim()
      : "";
    const parsed = insertChannelSchema.safeParse({
      name,
      description: description || undefined,
    });
    const channel = await storage.createChannel(
      parsed.success
        ? parsed.data
        : { name, description: description || undefined },
    );
    await broadcastChannelList();
    res.status(201).json(channel);
  });

  app.get("/api/channels/:channelId/messages", async (req, res) => {
    const { channelId } = req.params;
    const channel = await storage.getChannel(channelId);
    if (!channel) {
      return res.status(404).json({ error: "This group doesn't exist." });
    }
    const messages = await storage.getMessages(channelId);
    res.json(messages);
  });

  app.get("/api/channels/:channelId", async (req, res) => {
    const { channelId } = req.params;
    const channel = await storage.getChannel(channelId);
    if (!channel) {
      return res.status(404).json({ error: "This group doesn't exist." });
    }
    res.json(channel);
  });

  app.get("/api/documents/:documentId", async (req, res) => {
    const { documentId } = req.params;
    const document = await storage.getDocument(documentId);
    if (document) {
      res.json(document);
    } else {
      res.status(404).json({ error: "Document not found" });
    }
  });

  // Register object storage routes for file uploads
  registerObjectStorageRoutes(app);

  return httpServer;
}
