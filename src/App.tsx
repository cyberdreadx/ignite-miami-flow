import { Toaster } from "@/components/ui/feedback/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/overlays/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { UserRoleProvider } from "./contexts/UserRoleContext";
import { ErrorBoundary } from "./components/layout/ErrorBoundary";
import Index from "./pages/public/Index";
import Admin from "./pages/admin/AdminRebuild";
import AdminMembers from "./pages/admin/AdminMembers";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminDiagnosticsNew from "./pages/admin/AdminDiagnosticsNew";
import NewAdmin from "./pages/admin/NewAdmin";
import EnhancedMemberManagement from "./pages/admin/EnhancedMemberManagement";
import Auth from "./pages/auth/Auth";
import Profile from "./pages/user/Profile";
import About from "./pages/public/About";
import Tickets from "./pages/tickets/Tickets";
import Photographers from "./pages/public/Photographers";
import Qualifications from "./pages/public/Qualifications";
import Principles from "./pages/public/Principles";
import Merch from "./pages/public/Merch";
import Members from "./pages/user/Members";
import { MyTickets } from "./pages/tickets/MyTickets";
import { ValidateTicket } from "./pages/tickets/ValidateTicket";
import { PublicTicketView } from "./pages/tickets/PublicTicketView";
import { VerifyTicket } from "./pages/tickets/VerifyTicket";
import Affiliate from "./pages/user/Affiliate";
import PWAInstallPrompt from "./components/layout/PWAInstallPrompt";
import BottomNav from "./components/layout/BottomNav";
import NotFound from "./pages/public/NotFound";
import TestNotifications from "./pages/testing/TestNotifications";
import DatabaseTest from "./pages/testing/DatabaseTest";

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
    <ErrorBoundary>
      <AuthProvider>
        <UserRoleProvider>
          <TooltipProvider>
        <Toaster />
        <Sonner />
        <PWAInstallPrompt />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/admin" element={<NewAdmin />} />
            <Route path="/admin/legacy" element={<Admin />} />
            <Route path="/admin/members" element={<EnhancedMemberManagement />} />
            <Route path="/admin/members/legacy" element={<AdminMembers />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/diagnostics" element={<AdminDiagnosticsNew />} />
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
             <Route path="/affiliate" element={<Affiliate />} />
              <Route path="/validate" element={<ValidateTicket />} />
              <Route path="/verify" element={<PublicTicketView />} />
              <Route path="/ticket" element={<PublicTicketView />} />
              <Route path="/test-notifications" element={<TestNotifications />} />
              <Route path="/test-database" element={<DatabaseTest />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
            <BottomNav />
          </BrowserRouter>
          </TooltipProvider>
        </UserRoleProvider>
      </AuthProvider>
    </ErrorBoundary>
  </QueryClientProvider>
);

export default App;
