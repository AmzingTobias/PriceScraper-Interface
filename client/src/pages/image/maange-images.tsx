import { useEffect, useState } from "react";
import ManageImageCard from "../../components/image/manage-image-card";
import { tImageEntry } from "../../../../server/models/image.models";

interface IManageImagesPageProps {
  userIsAdmin: boolean;
}

function fetchAllImages(): Promise<tImageEntry[]> {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch("/api/images");
      if (response.ok) {
        const jsonResponse = await response.json();
        resolve(jsonResponse);
      } else {
        reject("Failed to get images");
      }
    } catch {
      reject("Failed to get images");
    }
  });
}

const ManageImagesPage: React.FC<IManageImagesPageProps> = ({
  userIsAdmin,
}) => {
  const [allImages, setAllImages] = useState<tImageEntry[]>([]);

  useEffect(() => {
    if (userIsAdmin) {
      fetchAllImages()
        .then((images) => {
          setAllImages(images);
        })
        .catch(() => {
          setAllImages([]);
        });
    }
  }, [userIsAdmin]);

  if (!userIsAdmin) {
    return <></>;
  }

  const deleteImage = (imageId: number) => {
    console.log("Deleting image: ", imageId);
    try {
      fetch(`/api/images/${imageId}`, {
        method: "DELETE",
      }).then((response) => {
        if (response.ok) {
          // Image deleted
          setAllImages((previousList) =>
            previousList.filter((image) => image.Id !== imageId)
          );
        } else {
          // Image couldn't be deleted
        }
      });
    } catch {
      // Image couldn't be deleted
    }
  };

  return (
    <>
      <div className="flex flex-col items-center">
        <div className="w-11/12 xl:w-4/5 2xl:w-3/5 mt-8">
          <div className="text-neutral-200 bg-gray-800 flex flex-col rounded-2xl px-2 py-4 lg:p-4">
            <h1 className="text-3xl underline font-bold">Manage Images</h1>
            <div className="flex justify-center">
              <div
                className="m-10 grid auto-cols-max auto-rows-min gap-6 grid-flow-dense 
      grid-cols-1
      sm:grid-cols-2
      md:grid-cols-2
      lg:grid-cols-3
      xl:grid-cols-4
      2xl:grid-cols-3
      3xl:grid-cols-4
      4xl:grid-cols-5
        product-grid "
              >
                {allImages.map((image, index) => (
                  <ManageImageCard
                    key={index}
                    imageLink={image.Link}
                    userIsAdmin={userIsAdmin}
                    imageId={image.Id}
                    deleteImageFunc={deleteImage}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ManageImagesPage;
