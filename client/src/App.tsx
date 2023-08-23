import { useEffect, useState } from "react";
import "./App.css";
import NavBar from "./components/nav-bar/nav-bar";
import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/home/home";
import LoginPage from "./pages/login/login";
import { useCookies } from "react-cookie";
import ProductPage from "./pages/product/product";
import { Chart, registerables } from "chart.js";
import jwtDecode from "jwt-decode";
import SettingsPage from "./pages/settings/settings";
import AdminPopup from "./components/admin/admin-popup";
import ImageUploadPage from "./pages/image/image-upload";
import NewProductPage from "./pages/product/new-product";
import PriceScraperLogPage from "./pages/admin/price-scraper-log";
import ManageImagesPage from "./pages/image/maange-images";

function validateAuthToken(authToken: string) {
  try {
    const decodedToken: any = jwtDecode(authToken);
    if (decodedToken.exp < Date.now() / 1000) {
      // Token expired
      return false;
    } else {
      return true;
    }
  } catch (_err) {
    return false;
  }
}

function useStateAuthCookie(): [string, React.Dispatch<any>] {
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
        path: "/",
      }); // Expires in 7 days
      if (state !== "") {
        const authTokenValid = validateAuthToken(state);
        if (authTokenValid === false) {
          setState("");
        }
      }
    }
  }, [state, cookies, setCookie]);
  if (state !== "") {
    const authTokenValid = validateAuthToken(state);
    if (authTokenValid === false) {
      setState("");
    }
  }
  return [state, setState];
}

const isUserAdmin = (): Promise<boolean> => {
  return new Promise(async (resolve, reject) => {
    try {
      const isAdminResponse = await fetch("/api/users/admin");
      if (isAdminResponse.ok) {
        const isAdminJson: boolean = await isAdminResponse.json();
        resolve(isAdminJson);
      } else {
        reject("Error in request");
      }
    } catch {
      reject("Error in request");
    }
  });
};

export default function App() {
  const [userAuthToken, setUserAuthToken] = useStateAuthCookie();
  const [userIsAdmin, setUserIsAdmin] = useState(false);

  useEffect(() => {
    isUserAdmin()
      .then((isAdmin) => {
        setUserIsAdmin(isAdmin);
      })
      .catch(() => {
        setUserIsAdmin(false);
      });
  }, [userAuthToken]);

  Chart.register(...registerables);

  return (
    <div className="App min-h-screen">
      <NavBar authToken={userAuthToken} />
      <div>
        <Routes>
          <Route path="/" Component={HomePage} />
          <Route
            path="/login"
            Component={() => LoginPage({ setUserAuthToken: setUserAuthToken })}
          />
          <Route
            path="/product/:productId"
            Component={() => ProductPage({ authToken: userAuthToken })}
          />
          <Route
            path="/settings"
            Component={() =>
              SettingsPage({
                authToken: userAuthToken,
                setUserAuthToken: setUserAuthToken,
              })
            }
          />
          <Route
            path="/admin/images/new"
            Component={() => ImageUploadPage({ userIsAdmin: userIsAdmin })}
          />
          <Route
            path="/admin/products/new"
            Component={() => NewProductPage({ userIsAdmin: userIsAdmin })}
          />
          <Route
            path="/admin/scraper-log"
            Component={() => PriceScraperLogPage({ userIsAdmin: userIsAdmin })}
          />
          <Route
            path="/admin/images"
            Component={() => ManageImagesPage({ userIsAdmin: userIsAdmin })}
          />
        </Routes>
        <AdminPopup userIsAdmin={userIsAdmin} />
      </div>
    </div>
  );
}
