import "./login-btn.css";

interface ILoginBtnProps {
  type: "submit";
  className: string;
  text: string;
}

const LoginBtn: React.FC<ILoginBtnProps> = (props) => {
  return (
    <>
      <button type={props.type} className={props.className}>
        {props.text}
      </button>
    </>
  );
};

export default LoginBtn;
