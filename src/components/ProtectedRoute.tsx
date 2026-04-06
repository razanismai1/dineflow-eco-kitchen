import { Navigate, useLocation } from "react-router-dom";
import { useApp, UserRole } from "@/contexts/AppContext";
import { getAccessToken } from "@/api/auth";

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export default function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const location = useLocation();
  const { userRole, isAuthLoading } = useApp();
  const tokenExists = !!getAccessToken();

  if (isAuthLoading || (tokenExists && !userRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <span className="w-6 h-6 border-2 border-accent/40 border-t-accent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground animate-pulse">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  // If not logged in, or token missing, redirect to home/login page
  if (!userRole || !tokenExists) {
    const from = `${location.pathname}${location.search}`;
    return <Navigate to="/login" replace state={{ from }} />;
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
