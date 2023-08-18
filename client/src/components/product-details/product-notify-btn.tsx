interface IProductNotifyBtnProps {
  btnText: string;
}

const ProductPageBtn: React.FC<IProductNotifyBtnProps> = ({ btnText }) => {
  return (
    <>
      <button
        className="px-8 py-3 rounded-full font-semibold uppercase
        bg-gray-800 border-green-500 border-solid border-4 text-neutral-200
        hover:shadow-fillInsideRoundedFull hover:shadow-green-500 hover:border-green-500 
        hover:duration-300 hover:transition hover:text-gray-800
        focus:border-neutral-200 focus:bg-green-500 focus:text-gray-800"
        type="submit"
      >
        {btnText}
      </button>
    </>
  );
};

export default ProductPageBtn;
