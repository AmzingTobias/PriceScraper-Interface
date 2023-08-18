import LoginBox from "../../components/login-box/login-box";

interface ILoginPageProps {
  setUserAuthToken: React.Dispatch<React.SetStateAction<string>>;
}

const LoginPage: React.FC<ILoginPageProps> = (props) => {
  return (
    <>
      <LoginBox setUserAuthToken={props.setUserAuthToken} />
    </>
  );
};

export default LoginPage;
