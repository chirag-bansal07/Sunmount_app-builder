import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
const API_URL = import.meta.env.VITE_API_URL;
interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isAdminLoggedIn");

    if (!isLoggedIn || isLoggedIn !== "true") {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  // Check if user is logged in
  const isLoggedIn = localStorage.getItem("isAdminLoggedIn");

  if (!isLoggedIn || isLoggedIn !== "true") {
    return null; // or a loading spinner
  }

  return <>{children}</>;
}
