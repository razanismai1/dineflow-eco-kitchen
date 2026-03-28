import { Navigate } from "react-router-dom";
import { useApp, UserRole } from "@/contexts/AppContext";

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export default function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { userRole } = useApp();

  // If not logged in, redirect to home/login page
  if (!userRole) {
    return <Navigate to="/" replace />;
  }

  // Admin can access everything
  if (userRole === "admin") {
    return <>{children}</>;
  }

  // If user role is not in the allowed roles, redirect
  // to their default page based on their role
  if (!allowedRoles.includes(userRole)) {
    switch (userRole) {
      case "chef":
        return <Navigate to="/kitchen" replace />;
      case "waiter":
        return <Navigate to="/floor" replace />;
      case "customer":
        return <Navigate to="/menu" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}
