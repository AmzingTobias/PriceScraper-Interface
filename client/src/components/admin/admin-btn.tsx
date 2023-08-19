import React from "react";
import { AiOutlinePlus, AiOutlineMinus } from "react-icons/ai";

interface IAdminBtnProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const AdminBtn: React.FC<IAdminBtnProps> = ({ open, setOpen }) => {
  return (
    <div
      onClick={() => setOpen((previousData) => !previousData)}
      className="fixed bottom-0 right-0 w-12 h-12 md:w-16 md:h-16 hover:bg-green-400 bg-green-500 rounded-full shadow-md flex items-center justify-center cursor-pointer m-4 text-gray-800 text-2xl"
    >
      {open ? <AiOutlineMinus /> : <AiOutlinePlus />}
    </div>
  );
};

export default AdminBtn;
