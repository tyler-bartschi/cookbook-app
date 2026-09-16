import { useState, useEffect, useRef } from "react";
import "./ProfileInfo.css";
import { ChevronDown } from "lucide-react";
import { NavLink } from "react-router-dom";

const ProfileInfo = () => {
  const [loggedIn] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);

  const panelRef = useRef<HTMLDivElement | null>(null);
  const toggleRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target instanceof Node)) return;

      const clickedPanel = panelRef.current?.contains(e.target);
      const clickedToggle = toggleRef.current?.contains(e.target);

      if (!clickedPanel && !clickedToggle) {
        setPanelOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [panelOpen]);

  return (
    <>
      {loggedIn ? (
        <div>Logged In placeholder</div>
      ) : (
        <div className="profile-info-wrapper">
          <NavLink to="/" className="login-button">
            {/* add a route for this (in App) then navigate to that route */}
            Login
          </NavLink>
          <div
            ref={toggleRef}
            className="profile-panel-toggle"
            aria-label="Toggle profile menu"
            aria-expanded={panelOpen}
            onClick={() => setPanelOpen((open) => !open)}
          >
            <img
              className="profile-image"
              src="/profile_image_placeholder.png"
              alt="profile image placeholder"
            />
            <ChevronDown
              className={
                panelOpen
                  ? "profile-info-chevron profile-info-chevron--open"
                  : "profile-info-chevron"
              }
            />
          </div>
        </div>
      )}
      {loggedIn ? (
        <div>logged in</div>
      ) : (
        <div
          ref={panelRef}
          className={panelOpen ? "profile-panel profile-panel--open" : "profile-panel"}
        >
          <NavLink className="profile-panel-link" to="/">
            Login
          </NavLink>
          <NavLink className="profile-panel-link" to="/">
            Register
          </NavLink>
        </div>
      )}
    </>
  );
};

export default ProfileInfo;
