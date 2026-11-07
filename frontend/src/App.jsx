import { Navigate, Outlet, Route, Routes, useLocation } from "react-router";
import AppShell from "./components/AppShell.jsx";
import BootScreen from "./components/BootScreen.jsx";
import Toaster from "./components/Toaster.jsx";
import { useAuthUser } from "./hooks/useAuth.js";
import AuthPage from "./pages/AuthPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";

function RequireAuth() {
  const { data: me, isPending, isError, error, refetch, isFetching } = useAuthUser();
  const location = useLocation();

  // A failed background refresh shouldn't interrupt someone who's already logged in.
  if (me) return <AppShell />;
  if (isPending) return <BootScreen />;
  if (isError) return <BootScreen error={error} onRetry={refetch} retrying={isFetching} />;

  return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
}

function GuestOnly() {
  const { data: me, isPending, isError, error, refetch, isFetching } = useAuthUser();
  const location = useLocation();

  if (me) return <Navigate to={location.state?.from ?? "/"} replace />;
  if (isPending) return <BootScreen />;
  if (isError) return <BootScreen error={error} onRetry={refetch} retrying={isFetching} />;

  return (
    <>
      <Outlet />
      <Toaster />
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<GuestOnly />}>
        <Route path="login" element={<AuthPage mode="login" />} />
        <Route path="signup" element={<AuthPage mode="signup" />} />
      </Route>
      <Route element={<RequireAuth />}>
        <Route index element={<HomePage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="profile/:username" element={<ProfilePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
