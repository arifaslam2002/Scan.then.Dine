import { Navigate, Outlet, useLocation } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("adminUser") || "null");
  const location = useLocation();

  // Redirect unauthenticated users to the correct login page
  if (!token || !user) {
    let loginPath = "/admin/login";

    if (location.pathname.startsWith("/kitchen")) {
      loginPath = "/kitchen/login";
    } else if (location.pathname.startsWith("/counter")) {
      loginPath = "/counter/login";
    }

    return <Navigate to={loginPath} replace />;
  }

  // Check whether the user's role is allowed
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === "kitchen") {
      return <Navigate to="/kitchen" replace />;
    }

    if (user.role === "counter") {
      return <Navigate to="/counter" replace />;
    }

    if (user.role === "admin") {
      return <Navigate to="/admin" replace />;
    }

    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
