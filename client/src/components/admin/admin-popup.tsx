import { useEffect, useState } from "react";
import AdminBtn from "./admin-btn";
import { useNavigate } from "react-router-dom";

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

type adminMenuLinkItem = {
  displayName: string;
  navLink: string;
};

interface IAdminPopupProps {
  userAuthToken: string;
}

const AdminPopup: React.FC<IAdminPopupProps> = ({ userAuthToken }) => {
  const [admin, setAdmin] = useState(false);
  const [popupOpen, setPopupOpen] = useState<boolean>(false);

  const adminMenuItems: adminMenuLinkItem[] = [
    { displayName: "New Product", navLink: "/admin/products/new" },
    { displayName: "New Image", navLink: "/admin/images/new" },
    { displayName: "Manage Products", navLink: "/admin/products" },
    { displayName: "Manage Images", navLink: "/admin/images" },
  ];

  const navigate = useNavigate();

  const handleAdminPopupClick = (navLink: string) => {
    navigate(navLink, { replace: false });
  };

  useEffect(() => {
    isUserAdmin()
      .then((isAdmin) => {
        setAdmin(isAdmin);
      })
      .catch(() => {
        setAdmin(false);
      });
  }, [userAuthToken]);

  if (admin === false) {
    return <></>;
  } else {
    return (
      <>
        <div>
          <AdminBtn open={popupOpen} setOpen={setPopupOpen} />
          {popupOpen ? (
            <div className="fixed bottom-16 md:bottom-20 right-0 mb-2 mr-4 bg-gray-800 text-xl text-neutral-200 shadow-md rounded-md p-2">
              {adminMenuItems.map((item) => (
                <div
                  onClick={() => handleAdminPopupClick(item.navLink)}
                  key={item.displayName}
                  className="cursor-pointer hover:bg-gray-700"
                >
                  {item.displayName}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </>
    );
  }
};
export default AdminPopup;
