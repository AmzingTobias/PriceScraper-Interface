import LoginBox from "../../components/login-box/login-box";

interface ILoginPageProps {
  setUserAuthToken: React.Dispatch<React.SetStateAction<string>>;
}

const LoginPage: React.FC<ILoginPageProps> = (props) => {
  return (
    <div>
      <LoginBox setUserAuthToken={props.setUserAuthToken}>
        <></>
      </LoginBox>
    </div>
  );
};

export default LoginPage;
