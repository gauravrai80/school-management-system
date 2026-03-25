import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { SectionSkeleton } from "@/components/common/QueryFeedback";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, role, token } = useAuth();
  const location = useLocation();

  if (loading) {
    return <SectionSkeleton label="Restoring your session..." />;
  }

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role || user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
