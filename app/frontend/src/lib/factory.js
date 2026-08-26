// Element / Page / Site factory defaults
const uid = (p = "id") => `${p}_${Math.random().toString(36).slice(2, 10)}`;

export function newElement(type, x = 80, y = 80) {
  const base = {
    id: uid("el"),
    type,
    x, y,
    width: 240,
    height: 80,
    rotation: 0,
    opacity: 1,
    zIndex: 1,
    locked: false,
    hidden: false,
    link: null, // { href, target, nofollow, kind:'url'|'page'|'anchor'|'email'|'tel'|'file' }
    animation: null, // { name, duration, delay, ease }
    responsive: { hideDesktop: false, hideTablet: false, hideMobile: false },
    style: {}, // extra CSS
    props: defaultProps(type),
  };
  const size = defaultSize(type);
  return { ...base, ...size };
}

function defaultSize(type) {
  switch (type) {
    case "text": return { width: 320, height: 60 };
    case "heading": return { width: 620, height: 140 };
    case "image": return { width: 320, height: 220 };
    case "video": return { width: 480, height: 270 };
    case "button": return { width: 160, height: 48 };
    case "form": return { width: 380, height: 340 };
    case "accordion": return { width: 420, height: 220 };
    case "shape": return { width: 160, height: 160 };
    case "line": return { width: 240, height: 2 };
    case "audio": return { width: 320, height: 60 };
    case "calendar": return { width: 320, height: 340 };
    case "chart": return { width: 380, height: 260 };
    case "quote": return { width: 420, height: 140 };
    case "code": return { width: 420, height: 200 };
    case "markdown": return { width: 380, height: 200 };
    case "embed": return { width: 420, height: 260 };
    case "social": return { width: 220, height: 48 };
    case "search": return { width: 260, height: 44 };
    case "container": return { width: 480, height: 260 };
    default: return { width: 240, height: 80 };
  }
}

function defaultProps(type) {
  switch (type) {
    case "text":
      return {
        html: "Double-click to edit this text.",
        fontFamily: "var(--font-ui)",
        fontSize: 18, fontWeight: 400, lineHeight: 1.5, letterSpacing: 0,
        color: "#000000", textAlign: "left",
        background: { type: "none", value: "" },
        padding: 8,
      };
    case "heading":
      return {
        html: "Your Big Idea",
        fontFamily: "var(--font-display)", fontSize: 56, fontWeight: 600,
        lineHeight: 1.05, letterSpacing: -1.2,
        color: "#000000", textAlign: "left",
        background: { type: "none", value: "" }, padding: 0,
        tag: "h1",
      };
    case "image":
      return {
        src: "",
        alt: "",
        fit: "cover", // cover | contain | fill
        focal: { x: 0.5, y: 0.5 },
        radius: 12, shadow: "none", opacity: 1,
        filters: { blur: 0, grayscale: 0, sepia: 0, brightness: 1, contrast: 1, saturate: 1, hueRotate: 0, invert: 0 },
        flipX: false, flipY: false,
        caption: "", lightbox: false,
      };
    case "video":
      return {
        source: "upload", // upload | youtube | vimeo | url
        src: "", poster: "",
        autoplay: false, muted: true, loop: false, controls: true,
        aspect: "16:9",
      };
    case "button":
      return {
        label: "Click me",
        bg: "#000000", color: "#ffffff", borderColor: "transparent", borderWidth: 0,
        radius: 999, fontWeight: 600, fontSize: 15,
        paddingX: 20, paddingY: 12,
        icon: null, iconPosition: "left",
        hoverBg: "#333333", hoverColor: "#ffffff",
        fullWidth: false, align: "left",
        shadow: "none",
      };
    case "form":
      return {
        title: "Contact us",
        fields: [
          { id: uid("f"), type: "text", label: "Name", placeholder: "Your name", required: true },
          { id: uid("f"), type: "email", label: "Email", placeholder: "you@site.com", required: true },
          { id: uid("f"), type: "textarea", label: "Message", placeholder: "Tell us more...", required: false },
        ],
        submitLabel: "Send",
        successMessage: "Thanks — we'll be in touch.",
        submitColor: "#000000",
        layout: "single", // single | double
      };
    case "accordion":
      return {
        items: [
          { id: uid("a"), title: "What is this?", body: "A collapsible content section.", open: false },
          { id: uid("a"), title: "How does it work?", body: "Click a title to expand.", open: false },
        ],
      };
    case "shape":
      return { shape: "rectangle", fill: "#000000", stroke: "transparent", strokeWidth: 0, radius: 12, opacity: 1 };
    case "line":
      return { color: "#000000", thickness: 2, style: "solid", orientation: "horizontal" };
    case "audio":
      return { src: "", autoplay: false, loop: false, muted: false, controls: true };
    case "calendar":
      return { mode: "single", selected: null };
    case "chart":
      return {
        variant: "bar", // bar | line | pie
        data: [{ name: "Jan", value: 12 }, { name: "Feb", value: 24 }, { name: "Mar", value: 18 }, { name: "Apr", value: 30 }],
        color: "#000000",
      };
    case "quote":
      return { text: "Design is intelligence made visible.", author: "Alina Wheeler", fontFamily: "var(--font-display)", fontSize: 24, color: "#000000" };
    case "code":
      return { language: "html", code: "<div>Hello world</div>", render: false, theme: "light" };
    case "markdown":
      return { md: "# Heading\n\nSome **markdown** content with a [link](https://example.com)." };
    case "embed":
      return { html: '<iframe src="about:blank" style="width:100%;height:100%;border:0;border-radius:12px"></iframe>' };
    case "social":
      return { items: [
        { platform: "instagram", url: "" },
        { platform: "twitter", url: "" },
        { platform: "github", url: "" },
      ], color: "#000000", size: 20, gap: 12 };
    case "search":
      return { placeholder: "Search…", color: "#000000", radius: 999 };
    case "container":
      return { background: { type: "color", value: "#f5f5f5" }, radius: 16, padding: 20 };
    default:
      return {};
  }
}

export function newPage(over = {}) {
  return {
    id: uid("pg"),
    title: "New Page",
    navTitle: "New Page",
    slug: "new-page-" + Math.random().toString(36).slice(2, 6),
    kind: "blank", // blank | link | dropdown
    linkUrl: "",
    children: [], // for dropdown -> array of {id, title, pageId}
    location: "main", // main | notLinked
    isHome: false,
    password: "",
    showHeader: true,
    showFooter: true,
    seo: { title: "", description: "", ogImage: "" },
    inject: { header: "", footer: "", body: "" },
    background: { type: "color", value: "#ffffff" },
    canvasHeight: 900,
    canvasWidth: 1280,
    elements: [],
    ...over,
  };
}

export function newSite(name = "Untitled site") {
  const home = newPage({ title: "Home", navTitle: "Home", slug: "home", isHome: true, location: "main" });
  home.elements = [
    { ...newElement("heading", 80, 100), props: { ...defaultProps("heading"), html: "Welcome to " + name } },
    { ...newElement("text", 80, 220), props: { ...defaultProps("text"), html: "Drag anything anywhere. Right-click for options. Use the + button to add elements." } },
    { ...newElement("button", 80, 300) },
  ];
  return {
    id: uid("site"),
    name,
    faction: "",
    favicon: "",
    createdAt: Date.now(), updatedAt: Date.now(),
    theme: { display: "Fraunces", body: "DM Sans", accent: "#000000", ink: "#000000", paper: "#ffffff" },
    background: { type: "color", value: "#ffffff" },
    header: {
      show: true, height: 72, background: { type: "color", value: "#ffffff" },
      elements: [
        { ...newElement("heading", 24, 18), width: 200, height: 36, props: { ...defaultProps("heading"), html: name, fontSize: 22, tag: "div" } },
      ],
    },
    footer: {
      show: true, height: 120, background: { type: "color", value: "#000000" },
      elements: [
        { ...newElement("text", 24, 40), width: 400, height: 30, props: { ...defaultProps("text"), html: "© " + name, color: "#ffffff" } },
      ],
    },
    gallery: [], // {id, name, type:'image'|'video'|'audio'|'file', data (base64), size, createdAt}
    pages: [home],
    currentPageId: home.id,
  };
}

export { uid };
