import { useEffect, useState } from "react";
import "./App.css";
import NavBar from "./components/nav-bar/nav-bar";
import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/home/home";
import LoginPage from "./pages/login/login";

export default function App() {
  const [backendData, setBackendData] = useState([]);

  useEffect(() => {
    fetch("/api/products")
      .then((response) => response.json())
      .then((data) => setBackendData(data))
      .catch((_error) => setBackendData([]));
  }, []);

  return (
    <div className="App">
      <NavBar />
      <div className="container">
        <Routes>
          <Route path="/" Component={HomePage} />
          <Route path="/login" Component={LoginPage} />
        </Routes>
      </div>
    </div>
  );
}
