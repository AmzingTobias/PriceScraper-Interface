import { useEffect, useState } from "react";
import "./App.css";
import NavBar from "./components/nav-bar/nav-bar";
import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/home/home";
import LoginPage from "./pages/login/login";
import { useCookies } from "react-cookie";

function useStateAuthCookie(initialValue: any): [any, React.Dispatch<any>] {
  const AUTH_TOKEN_NAME = "auth-token";
  const [cookies, setCookie] = useCookies([AUTH_TOKEN_NAME]);
  const initialCookieValue: string | undefined = cookies[AUTH_TOKEN_NAME];
  const [state, setState] = useState<string>(
    initialCookieValue === undefined ? "" : initialCookieValue
  );
  useEffect(() => {
    const cookieValue: string | undefined = cookies[AUTH_TOKEN_NAME];
    if (cookieValue !== state) {
      setCookie(AUTH_TOKEN_NAME, state, {
        sameSite: "lax",
        secure: true,
        maxAge: 7 * 24 * 60 * 60,
      }); // Expires in 7 days
    }
  }, [state, cookies, setCookie]);
  return [state, setState];
}

export default function App() {
  const [userAuthToken, setUserAuthToken] = useStateAuthCookie("");

  return (
    <div className="App">
      <NavBar authToken={userAuthToken} />
      <div className="container">
        <Routes>
          <Route path="/" Component={HomePage} />
          <Route
            path="/login"
            Component={() => LoginPage({ setUserAuthToken: setUserAuthToken })}
          />
        </Routes>
      </div>
    </div>
  );
}
