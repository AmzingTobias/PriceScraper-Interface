import { useEffect, useState } from "react";

interface IManageImageCardProps {
  userIsAdmin: boolean;
  imageLink: string;
  imageId: number;
  deleteImageFunc: (imageId: number) => void;
}

const ManageImageCard: React.FC<IManageImageCardProps> = ({
  userIsAdmin,
  imageLink,
  imageId,
  deleteImageFunc,
}) => {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const toggleConfirm = () => {
    setConfirmDelete(true);
  };

  useEffect(() => {
    if (confirmDelete) {
      const timeout = setTimeout(() => {
        // Automatically reset to Confirm Step 1 after x seconds
        setConfirmDelete(false);
      }, 2500); // Replace 5000 with the desired time in milliseconds

      // Clear the timeout if the component unmounts or confirmation step changes
      return () => clearTimeout(timeout);
    }
  }, [confirmDelete]);

  return (
    <>
      <div className="w-60 block">
        <div className="relative">
          <img
            className="duration-200 transition shadow-xl shadow-gray-800 "
            width={320}
            height={480}
            style={{ width: 245, height: 340 }}
            src={imageLink}
            alt={"cover art"}
          />
          <button
            className="absolute bottom-0 left-0 m-1 opacity-80 hover:opacity-100
          px-8 py-1 rounded-full font-semibold uppercase
          bg-gray-800 border-red-500 border-solid border-4 text-neutral-200
           hover:shadow-red-500 hover:border-red-500 
          hover:duration-300 hover:transition
          focus:border-neutral-200 focus:bg-red-500 focus:text-gray-800"
            onClick={
              confirmDelete ? () => deleteImageFunc(imageId) : toggleConfirm
            }
          >
            {confirmDelete ? "Confirm" : "Delete"}
          </button>
          <p
            className="absolute top-0 left-0 m-1 opacity-95 bg-gray-800 text-neutral-200 p-2 rounded-lg
            border-neutral-200 border-2 hover:cursor-default"
          >
            ID: {imageId}
          </p>
        </div>
      </div>
    </>
  );
};

export default ManageImageCard;
