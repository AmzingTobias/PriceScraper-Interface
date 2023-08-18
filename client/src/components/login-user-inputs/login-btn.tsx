interface ILoginBtnProps {
  type: "submit";
  text: string;
}

const LoginBtn: React.FC<ILoginBtnProps> = (props) => {
  return (
    <>
      <button
        type={props.type}
        className="text-2xl p-2.5 w-full 
      bg-gray-800 text-neutral-200
      box-border outline-none rounded-md
      border-green-500 border-solid border-4
      hover:border-neutral-200 hover:scale-105 cursor-pointer
      active:opacity-60"
      >
        {props.text}
      </button>
    </>
  );
};

export default LoginBtn;
