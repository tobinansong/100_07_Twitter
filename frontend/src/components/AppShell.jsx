import { useEffect, useSyncExternalStore } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router";
import { useAuthUser, useLogout } from "../hooks/useAuth.js";
import { useNotifications } from "../hooks/useNotifications.js";
import { useSecondClock } from "../lib/clock.js";
import { formatUtcClock, profilePath } from "../lib/format.js";
import Avatar from "./Avatar.jsx";
import ContactsPanel from "./ContactsPanel.jsx";
import Icon from "./Icon.jsx";
import Logo from "./Logo.jsx";
import OrbitField from "./OrbitField.jsx";
import Toaster from "./Toaster.jsx";

function subscribeOnline(listener) {
  window.addEventListener("online", listener);
  window.addEventListener("offline", listener);
  return () => {
    window.removeEventListener("online", listener);
    window.removeEventListener("offline", listener);
  };
}

function UtcClock() {
  const now = useSecondClock();
  return <span className="hud__readout">UTC {formatUtcClock(now)}</span>;
}

function HudStrip() {
  const online = useSyncExternalStore(subscribeOnline, () => navigator.onLine);
  const logout = useLogout();

  return (
    <header className="hud">
      <Link to="/" className="hud__brand" aria-label="Home">
        <Logo />
      </Link>
      <div className="hud__readouts">
        <span className={`hud__readout hud__link${online ? "" : " is-down"}`}>
          <span className="hud__led" aria-hidden="true" />
          {online ? "Link online" : "Link lost"}
        </span>
        <UtcClock />
        <button
          type="button"
          className="icon-btn hud__logout"
          aria-label="Log out"
          disabled={logout.isPending}
          onClick={() => logout.mutate()}
        >
          <Icon name="logout" size={18} />
        </button>
      </div>
    </header>
  );
}

function Rail({ me, unreadCount }) {
  const logout = useLogout();
  const items = [
    { to: "/", label: "Home", icon: "home", end: true },
    { to: "/notifications", label: "Alerts", icon: "bell", badge: unreadCount },
    { to: profilePath(me.username), label: "Profile", icon: "user" },
  ];

  return (
    <div className="rail">
      <nav aria-label="Main">
        <ul className="rail__nav">
          {items.map((item, index) => (
            <li key={item.to}>
              <NavLink to={item.to} end={item.end} className="rail__link">
                <span className="rail__index" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="rail__icon">
                  <Icon name={item.icon} />
                  {item.badge > 0 && (
                    <span className="rail__badge">
                      <span aria-hidden="true">{item.badge > 99 ? "99+" : item.badge}</span>
                      <span className="sr-only">{item.badge} unread</span>
                    </span>
                  )}
                </span>
                <span className="rail__label">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="rail__me">
        <Link to={profilePath(me.username)} className="rail__who">
          <Avatar user={me} size="sm" />
          <span className="contact__names rail__names">
            <span className="contact__name">{me.fullName}</span>
            <span className="post__handle">@{me.username}</span>
          </span>
        </Link>
        <button
          type="button"
          className="icon-btn"
          aria-label="Log out"
          title="Log out"
          disabled={logout.isPending}
          onClick={() => logout.mutate()}
        >
          <Icon name="logout" size={18} />
        </button>
      </div>
    </div>
  );
}

export default function AppShell() {
  const { data: me } = useAuthUser();
  const { unreadCount } = useNotifications({ poll: true });
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="shell">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <OrbitField />
      <HudStrip />
      <div className="shell__grid">
        <Rail me={me} unreadCount={unreadCount} />
        <main id="main" className="shell__main">
          <Outlet />
        </main>
        <aside className="shell__side" aria-label="Suggested people">
          <ContactsPanel />
        </aside>
      </div>
      <Toaster />
    </div>
  );
}
