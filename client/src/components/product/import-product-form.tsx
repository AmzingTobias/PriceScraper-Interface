import { FormEvent, useState } from "react";

const ImportProductForm = () => {
    const [importLink, setImportLink] = useState("");
    const [warningMessage, setWarningMessage] = useState<string>("");

    const handleFormSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        if (importLink !== "") {
            const productImportResponse = await fetch(
                "/api/scraper/import",
                {
                    method: "PATCH",
                    headers: {
                        "Content-type": "application/json",
                    },
                    body: JSON.stringify({
                        import_link: importLink,
                    }),
                }
            );

            if (productImportResponse.ok) {
                const productResponseText = await productImportResponse.text();
                alert(productResponseText);
                // Clear form data
                setImportLink("");
            } else {
                setWarningMessage("Error occured in request for creating product");
            }
        }
    };

    return (
        <>
            <div className="text-neutral-200">
                <form onSubmit={handleFormSubmit}>
                    <div className="sm:flex-row sm:flex">
                        <div className="sm:w-8/12 mr-2">
                            <div className="flex flex-col">
                                <label className="mb-2 hidden" htmlFor="product-name">
                                    Import Link
                                </label>
                                <input
                                    required
                                    className="w-full bg-gray-600 box-border outline-none text-neutral-200
            hover:outline-green-500 focus:outline-green-500 rounded-2xl px-4 py-2"
                                    type="text"
                                    name="product-name"
                                    id="product-name"
                                    placeholder="Product Name"
                                    value={importLink}
                                    onChange={(e) => setImportLink(e.target.value)}
                                />
                            </div>
                        </div>
                        <hr className="mb-4 mt-6" />
                        <div>
                            <p className="text-red-500 text-base font-medium italic animate-pulse text-center mb-4">
                                {warningMessage}
                            </p>
                            <button
                                className="px-8 w-full py-1 rounded-full font-semibold uppercase
              bg-gray-800 border-green-500 border-solid border-4 text-neutral-200
              hover:shadow-fillInsideRoundedFull hover:shadow-green-500 hover:border-green-500 
              hover:duration-300 hover:transition hover:text-gray-800
              focus:border-neutral-200 focus:bg-green-500 focus:text-gray-800"
                                type="submit"
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
};

export default ImportProductForm;
