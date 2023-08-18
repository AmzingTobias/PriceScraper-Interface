import { FormEvent } from "react";
import { useNavigate } from "react-router-dom";

interface ILogoutBtnProps {
  setUserAuthToken: React.Dispatch<React.SetStateAction<string>>;
}

const LogoutBtn: React.FC<ILogoutBtnProps> = ({ setUserAuthToken }) => {
  const navigate = useNavigate();

  const logout = (event: FormEvent) => {
    event.preventDefault();
    setUserAuthToken("");
    navigate("/", { replace: true });
  };

  return (
    <>
      <form onSubmit={logout}>
        <button
          className="px-8 py-3 rounded-full font-semibold uppercase
        bg-gray-800 border-red-500 border-solid border-4 text-neutral-200
        hover:shadow-fillInsideRoundedFull hover:shadow-red-500 hover:border-red-500 
        hover:duration-300 hover:transition hover:text-gray-800
        focus:border-neutral-200 focus:bg-red-500 focus:text-gray-800"
        >
          Logout
        </button>
      </form>
    </>
  );
};

export default LogoutBtn;
