import { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { AnimatePresence, motion } from 'framer-motion';
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/hooks/useAuth";
import LoadingScreen from "@/components/LoadingScreen";
import ThemeToggle from "@/components/ThemeToggle";
import Index from "./pages/Index";
import LiveTV from "./pages/LiveTV";
import Programs from "./pages/Programs";
import ProgramDetail from "./pages/ProgramDetail";
import Monks from "./pages/Monks";
import MonkProfile from "./pages/MonkProfile";
import LaySpeakers from "./pages/LaySpeakers";
import LaySpeakerProfile from "./pages/LaySpeakerProfile";
import Schedule from "./pages/Schedule";
import MediaLibrary from "./pages/MediaLibrary";
import About from "./pages/About";
import Contact from "./pages/Contact";
import DharmaTalkSubmission from "./pages/DharmaTalkSubmission";
import NotFound from "./pages/NotFound";

// Admin pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminSchedule from "./pages/admin/AdminSchedule";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminDharmaSettings from "./pages/admin/AdminDharmaSettings";
import AdminRequests from "./pages/admin/AdminRequests";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminMedia from "./pages/admin/AdminMedia";
import AdminContactMessages from "./pages/admin/AdminContactMessages";
import AdminOrdering from "./pages/admin/AdminOrdering";

const queryClient = new QueryClient();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const minLoadTime = setTimeout(() => {
      setIsLoading(false);
      setTimeout(() => setShowContent(true), 100);
    }, 1500);

    return () => clearTimeout(minLoadTime);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <TooltipProvider>
                <AnimatePresence mode="wait">
                  {isLoading && <LoadingScreen isLoading={isLoading} />}
                </AnimatePresence>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: showContent ? 1 : 0 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                >
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <Routes>
                      {/* Public routes */}
                      <Route path="/" element={<Index />} />
                      <Route path="/live" element={<LiveTV />} />
                      <Route path="/programs" element={<Programs />} />
                      <Route path="/programs/:id" element={<ProgramDetail />} />
                      <Route path="/monks" element={<Monks />} />
                      <Route path="/monks/:id" element={<MonkProfile />} />
                      <Route path="/lay-speakers" element={<LaySpeakers />} />
                      <Route path="/lay-speakers/:id" element={<LaySpeakerProfile />} />
                      <Route path="/schedule" element={<Schedule />} />
                      <Route path="/media" element={<MediaLibrary />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/request-dharma-deshana" element={<DharmaTalkSubmission />} />
                      
                      {/* Admin routes */}
                      <Route path="/admin/login" element={<AdminLogin />} />
                      <Route path="/admin" element={<AdminLayout />}>
                        <Route path="dashboard" element={<AdminDashboard />} />
                        {/* Programs management is now in dharma-settings */}
                        <Route path="schedule" element={<AdminSchedule />} />
                        <Route path="events" element={<AdminEvents />} />
                        <Route path="dharma-settings" element={<AdminDharmaSettings />} />
                        <Route path="requests" element={<AdminRequests />} />
                        <Route path="users" element={<AdminUsers />} />
                        <Route path="media" element={<AdminMedia />} />
                        <Route path="contact-messages" element={<AdminContactMessages />} />
                        <Route path="ordering" element={<AdminOrdering />} />
                      </Route>
                      
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </BrowserRouter>
                  <ThemeToggle />
                </motion.div>
              </TooltipProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
};

export default App;
