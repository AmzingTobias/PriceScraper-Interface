import { FormEvent, useEffect, useState } from "react";
import product_card_missing from "../../assets/product_card_missing.png";

const ImageUploadForm = () => {
  const [imageData, setImageData] = useState<File>();
  const [imageUrl, setImageUrl] = useState<string>(product_card_missing);

  function submitForm(e: FormEvent) {
    e.preventDefault();
    if (imageData !== undefined) {
      try {
        const formData = new FormData();
        formData.append("image", imageData);
        fetch("/api/images/", {
          method: "POST",
          body: formData,
        });
      } catch {}
    }
  }

  useEffect(() => {
    if (imageData !== undefined) {
      const read = new FileReader();
      read.onload = (e) => {
        if (typeof e.target?.result !== "string") {
          setImageUrl(product_card_missing);
        } else {
          setImageUrl(e.target.result);
        }
      };

      read.readAsDataURL(imageData);
    } else {
      setImageUrl(product_card_missing);
    }
  }, [imageData]);

  return (
    <>
      <form onSubmit={submitForm}>
        <div className="sm:flex sm:flex-row  my-4">
          <div className="sm:flex-1 justify-center items-center flex">
            {imageUrl === "" ? null : (
              <img src={imageUrl} width={240} height={360} />
            )}
          </div>
          <div className="flex sm:flex-col justify-center items-center sm:flex-1">
            <div className="file-input">
              <input
                id="image"
                className="file opacity-0"
                accept="image/*"
                onChange={(e) =>
                  setImageData(
                    e.target.files !== null ? e.target.files[0] : undefined
                  )
                }
                type="file"
              />
              <label
                htmlFor="image"
                className="border-yellow-400 bg-transparent border-4 border-solid flex items-center justify-center
                text-neutral-200 font-semibold cursor-pointer rounded-full px-8 py-1 relative w-full
                hover:shadow-fillInsideRoundedFull hover:shadow-yellow-400 hover:text-gray-800 hover:border-yellow-400  "
              >
                Select Image
              </label>
              <div className="mt-4">
                <button
                  className="px-8 w-full py-1 rounded-full font-semibold uppercase
              bg-gray-800 border-green-500 border-solid border-4 text-neutral-200
              hover:shadow-fillInsideRoundedFull hover:shadow-green-500 hover:border-green-500 
              hover:duration-300 hover:transition hover:text-gray-800
              focus:border-neutral-200 focus:bg-green-500 focus:text-gray-800"
                  type="submit"
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </>
  );
};

export default ImageUploadForm;
