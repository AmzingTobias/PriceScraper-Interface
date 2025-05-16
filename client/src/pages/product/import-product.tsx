import ImportProductForm from "../../components/product/import-product-form";

interface INewProductPageProps {
    userIsAdmin: boolean;
}

const ImportProductPage: React.FC<INewProductPageProps> = ({ userIsAdmin }) => {
    if (!userIsAdmin) {
        return <></>;
    } else {
        return (
            <>
                <div>
                    <div className="flex flex-col items-center">
                        <div
                            className="
              w-11/12
              xl:w-4/5
              2xl:w-3/5
              my-8"
                        >
                            <div
                                className="text-neutral-200 bg-gray-800 
      flex flex-col rounded-2xl px-2 py-4 lg:p-4"
                            >
                                <h1 className="text-3xl underline font-bold">Import Product</h1>
                                <div className="mt-4">
                                    <ImportProductForm />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }
};

export default ImportProductPage;
