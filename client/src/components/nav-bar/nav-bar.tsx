import React, { useState, useRef, useEffect } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { MdOutlineAccountCircle, MdOutlineSettings } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import "./nav-bar.css";
import { IconContext } from "react-icons";

interface INavBarProps {
  authToken: string;
}

const NavBar: React.FC<INavBarProps> = (props) => {
  const loggedIn: boolean = props.authToken !== "";

  const navRef = useRef<HTMLElement | null>(null);

  const navigate = useNavigate();

  const goHome = () => {
    closeNavbarIfOpen();
    navigate("/", { replace: false });
  };

  const goToLogin = () => {
    closeNavbarIfOpen();
    navigate("/login", { replace: false });
  };

  const goToSettings = () => {
    closeNavbarIfOpen();
    navigate("/settings", { replace: false });
  };

  const showNavbar = () => {
    if (navRef.current) {
      navRef.current.classList.toggle("responsive_nav");
    }
  };

  const closeNavbarIfOpen = () => {
    if (navRef.current) {
      if (navRef.current.classList.contains("responsive_nav")) {
        navRef.current.classList.toggle("responsive_nav");
      }
    }
  };

  const [isNavSticky, setIsNavSticky] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsNavSticky(true);
      } else {
        setIsNavSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });

  return (
    <header className={isNavSticky ? "sticky" : ""}>
      <h1 onClick={goHome}>PriceScraper</h1>
      <nav ref={navRef}>
        <button
          className={
            loggedIn
              ? "nav-btn account-btn account-settings-btn"
              : "nav-btn account-btn"
          }
          onClick={loggedIn ? goToSettings : goToLogin}
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
};

export default NavBar;
