import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { OnboardingModal } from "@/components/onboarding-modal";
import { useLocalUser } from "@/hooks/use-local-user";
import NotFound from "@/pages/not-found";
import ChatPage from "@/pages/chat";
import HomePage from "@/pages/home";
import { motion } from "framer-motion";

function Router() {
  const { user, isLoading, createUser } = useLocalUser();

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return <OnboardingModal onComplete={createUser} />;
  }

  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/g/:id">
        {(params) => <ChatPage key={params.id} groupId={params.id ?? ""} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
