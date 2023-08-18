import "./login-box.css";
import { FormEvent, useState } from "react";
import LoginField, { EFieldType } from "../login-user-inputs/login-field";
import LoginBtn from "../login-user-inputs/login-btn";
import { useNavigate } from "react-router-dom";

interface IContextBoxProps {
  style?: React.CSSProperties;
  setUserAuthToken?: React.Dispatch<React.SetStateAction<string>>;
}

enum EFormType {
  login,
  signup,
}

type TLoginInputs = {
  username: string;
  password: string;
};

type TLoginResponseJson = {
  token: string;
};

function validatePassword(password: string): boolean {
  // Password should be length of 7 or more
  // Password should contain a mix of numbers, and characters
  // Password should contain a mix of upper and lower case
  // Regex for that: ^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{7,}$
  // ^ for the start of the string
  // (?=.*[a-z]) - Positive lookahead to check for at least one character
  // (?=.*[A-Z]) - Positive lookahead to check for at least one uppercase character
  // (?=.*\d) - Positive lookahead to check for at least one digit
  // .{7,} Match any character, except new line 7 times
  // $ Marks the end of the string
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{7,}$/;
  return passwordRegex.test(password);
}

const LoginBox: React.FC<IContextBoxProps> = (props) => {
  const navigate = useNavigate();

  const [formType, setFormType] = useState<EFormType>(EFormType.login);
  const [loginInputs, setLoginInputs] = useState<TLoginInputs>({
    username: "",
    password: "",
  });

  const [warningMessage, setWarningMessage] = useState("");

  const loginForm = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const loginResponse = await fetch("/api/users/login", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(loginInputs),
      });
      if (loginResponse.ok) {
        // Login the user
        const loginResponseJson: TLoginResponseJson =
          await loginResponse.json();
        if (
          props.setUserAuthToken &&
          typeof loginResponseJson.token === "string"
        ) {
          props.setUserAuthToken(`JWT ${loginResponseJson.token}`);
          navigate("/", { replace: false });
        }
      } else {
        setWarningMessage("Username or password incorrect");
      }
    } catch {
      setWarningMessage("Unknown error");
    }
  };

  const signupForm = async (event: FormEvent) => {
    event.preventDefault();
    if (validatePassword(loginInputs.password)) {
      try {
        const signupResponse = await fetch("/api/users/signup", {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify(loginInputs),
        });
        if (signupResponse.ok) {
          loginForm(event);
        } else {
          setWarningMessage("User already exists");
        }
      } catch {
        setWarningMessage("Unknown error");
      }
    } else {
      setWarningMessage(
        "Password should contain a number a mix of upper and lower case and be 7 characters long"
      );
    }
  };

  const handleInputChange = (fieldName: keyof TLoginInputs, value: string) => {
    setLoginInputs((previousData) => ({
      ...previousData,
      [fieldName]: value,
    }));
  };

  const toggleFormType = (formToChangeTo: EFormType) => {
    if (formToChangeTo !== formType) {
      setWarningMessage(" ");
      setFormType(
        formType === EFormType.login ? EFormType.signup : EFormType.login
      );
    }
  };

  return (
    <div
      className="login-box w-full  flex justify-center items-center
     text-neutral-200"
      style={props.style}
    >
      <div className="flex flex-col w-11/12 sm:w-120 my-8 2xl:w-160 bg-gray-800 p-4 rounded-2xl">
        <div className="flex">
          <div className="flex-1">
            <button
              className={
                "w-full h-full text-3xl p-5 font-bold rounded-tl-2xl " +
                (formType !== EFormType.login
                  ? "bg-gray-900"
                  : "underline cursor-default")
              }
              onClick={() => toggleFormType(EFormType.login)}
            >
              Login
            </button>
          </div>
          <div className="flex-1">
            <button
              className={
                "w-full h-full text-3xl p-5 font-bold rounded-tr-2xl " +
                (formType !== EFormType.signup
                  ? "bg-gray-900"
                  : "underline cursor-default")
              }
              onClick={() => toggleFormType(EFormType.signup)}
            >
              Signup
            </button>
          </div>
        </div>
        <div>
          <form
            onSubmit={formType === EFormType.login ? loginForm : signupForm}
          >
            <div className="my-2.5">
              <LoginField
                id="username"
                name="username"
                placeholder="Username"
                type={EFieldType.USERNAME}
                onChange={(event) => handleInputChange("username", event)}
              />
            </div>
            <div className="my-2.5">
              <LoginField
                id="password"
                name="password"
                placeholder="Password"
                type={EFieldType.PASSWORD}
                onChange={(event) => handleInputChange("password", event)}
              />
            </div>
            <p className="text-red-500 text-base font-medium italic">
              {warningMessage}
            </p>
            <div className="mt-2.5">
              <LoginBtn
                text={formType === EFormType.login ? "Login" : "Signup"}
                type={"submit"}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginBox;
