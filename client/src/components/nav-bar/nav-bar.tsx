import React, { useRef } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { MdOutlineAccountCircle, MdOutlineSettings } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import "./nav-bar.css";
import { IconContext } from "react-icons";

function NavBar() {
  const loggedIn: boolean = true;

  const navRef = useRef<HTMLElement | null>(null);

  const navigate = useNavigate();

  const goHome = () => {
    navigate("/", { replace: true });
  };

  const showNavbar = () => {
    if (navRef.current) {
      navRef.current.classList.toggle("responsive_nav");
    }
  };

  return (
    <header>
      <h2 onClick={goHome}>PriceScraper</h2>
      <nav ref={navRef}>
        <button
          className={
            loggedIn
              ? "nav-btn account-btn account-settings-btn"
              : "nav-btn account-btn"
          }
        >
          <IconContext.Provider value={{ size: "2em" }}>
            {loggedIn ? <MdOutlineSettings /> : <MdOutlineAccountCircle />}
          </IconContext.Provider>
        </button>
        <button className="nav-btn nav-close-btn" onClick={showNavbar}>
          <FaTimes />
        </button>
      </nav>
      <button className="nav-btn" onClick={showNavbar}>
        <FaBars />
      </button>
    </header>
  );
}

export default NavBar;
