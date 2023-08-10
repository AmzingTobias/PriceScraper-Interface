import { useEffect, useState } from "react";
import "./App.css";
import NavBar from "./components/nav-bar/nav-bar";
import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/home";

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
      <Routes>
        <Route path="/" Component={HomePage} />
      </Routes>
    </div>
  );
}
