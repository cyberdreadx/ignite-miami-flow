import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import About from "./pages/About";
import Tickets from "./pages/Tickets";
import Photographers from "./pages/Photographers";
import Qualifications from "./pages/Qualifications";
import Principles from "./pages/Principles";
import Merch from "./pages/Merch";
import Members from "./pages/Members";
import { MyTickets } from "./pages/MyTickets";
import { ValidateTicket } from "./pages/ValidateTicket";
import { PublicTicketView } from "./pages/PublicTicketView";
import { VerifyTicket } from "./pages/VerifyTicket";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import BottomNav from "./components/BottomNav";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime)
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <PWAInstallPrompt />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/about" element={<About />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/photographers" element={<Photographers />} />
           <Route path="/qualifications" element={<Qualifications />} />
           <Route path="/principles" element={<Principles />} />
           <Route path="/merch" element={<Merch />} />
           <Route path="/members" element={<Members />} />
          <Route path="/my-tickets" element={<MyTickets />} />
           <Route path="/validate" element={<ValidateTicket />} />
           <Route path="/verify" element={<VerifyTicket />} />
           <Route path="/ticket" element={<PublicTicketView />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <BottomNav />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
