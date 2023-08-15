import React, { useState, useRef, useEffect } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { MdOutlineAccountCircle, MdOutlineSettings } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { IconContext } from "react-icons";

interface INavBarProps {
  authToken: string;
}

const NavBar: React.FC<INavBarProps> = (props) => {
  const loggedIn: boolean = props.authToken !== "";

  const navRef = useRef<HTMLElement | null>(null);

  const navigate = useNavigate();

  const goHome = () => {
    navigate("/", { replace: false });
  };

  const goToLogin = () => {
    navigate("/login", { replace: false });
  };

  const goToSettings = () => {
    navigate("/settings", { replace: false });
  };

  return (
    <header className="flex items-center px-8 text-neutral-200 h-20 bg-purple-700 bg-opacity-30">
      <h1
        onClick={goHome}
        className="text-3xl font-bold hover:text-red-500 hover:cursor-pointer mr-7"
      >
        PriceScraper
      </h1>
      <nav ref={navRef} className="contents">
        <button
          className={
            loggedIn
              ? "nav-btn account-btn ml-auto account-settings-btn hover:rotate-60 hover:transition hover:duration-1000"
              : "nav-btn account-btn ml-auto"
          }
          onClick={loggedIn ? goToSettings : goToLogin}
        >
          <IconContext.Provider value={{ size: "2em" }}>
            {loggedIn ? <MdOutlineSettings /> : <MdOutlineAccountCircle />}
          </IconContext.Provider>
        </button>
      </nav>
    </header>
  );
};

export default NavBar;
