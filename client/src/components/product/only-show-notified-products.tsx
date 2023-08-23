export enum ENotifiedProductsBtnStatus {
  AllProducts,
  OnlyNotified,
}

interface IOnlyShowNotifiedProductsBtnProps {
  state: ENotifiedProductsBtnStatus;
  setState: React.Dispatch<React.SetStateAction<ENotifiedProductsBtnStatus>>;
}

const OnlyShowNotifiedProductsBtn: React.FC<
  IOnlyShowNotifiedProductsBtnProps
> = ({ state, setState }) => {
  const toggleState = () => {
    setState((previous) =>
      previous === ENotifiedProductsBtnStatus.AllProducts
        ? ENotifiedProductsBtnStatus.OnlyNotified
        : ENotifiedProductsBtnStatus.AllProducts
    );
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 w-12 h-12 md:w-16 md:h-16 mx-4 my-3">
        <button
          className="px-6 w-full sm:w-max py-3 rounded-full font-semibold uppercase hover:bg-green-400 bg-green-500 text-gray-800 
          border-4 border-gray-800"
          onClick={toggleState}
          type="button"
        >
          {state === ENotifiedProductsBtnStatus.AllProducts
            ? "Show notified products"
            : "Show all products"}
        </button>
      </div>
    </>
  );
};

export default OnlyShowNotifiedProductsBtn;
