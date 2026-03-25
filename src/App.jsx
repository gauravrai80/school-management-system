import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.jsx";
import NotFound from "./pages/NotFound.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import ProtectedRoute from "@/components/ProtectedRoute";
import PaymentSuccess from "./pages/PaymentSuccess.jsx";

const Unauthorized = () => (
  <div className="min-h-screen flex items-center justify-center bg-background px-6 text-center">
    <div className="glass rounded-2xl p-8 max-w-md">
      <h1 className="text-3xl font-display font-bold text-foreground mb-3">Access Restricted</h1>
      <p className="text-text-muted font-body">Your account does not have permission to view this page.</p>
    </div>
  </div>
);

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/admin/login" element={<Navigate to="/login" replace />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin', 'teacher', 'student', 'parent']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;
