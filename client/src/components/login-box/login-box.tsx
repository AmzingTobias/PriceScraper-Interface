import { FormEvent, ReactNode, useState } from "react";
import "./login-box.css";
import LoginField, { EFieldType } from "../login-user-inputs/login-field";
import LoginBtn from "../login-user-inputs/login-btn";
import { useNavigate } from "react-router-dom";

interface IContextBoxProps {
  children: ReactNode;
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
  const loginFormTypeClassNames =
    "mode-btn btn " + (formType === EFormType.login ? "active" : "inactive");
  const signupFormTypeClassNames =
    "mode-btn btn " + (formType === EFormType.signup ? "active" : "inactive");
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
          props.setUserAuthToken(loginResponseJson.token);
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
    <div className="content-box" style={props.style}>
      <div className="flex-container">
        <div className="split-sides">
          <div className="left-side">
            <button
              className={loginFormTypeClassNames}
              onClick={() => toggleFormType(EFormType.login)}
            >
              Login
            </button>
          </div>
          <div className="right-side">
            <button
              className={signupFormTypeClassNames}
              onClick={() => toggleFormType(EFormType.signup)}
            >
              Signup
            </button>
          </div>
        </div>
        <div className="bottom-div">
          <form
            onSubmit={formType === EFormType.login ? loginForm : signupForm}
          >
            <div className="input-field">
              <LoginField
                id="username"
                name="username"
                placeholder="Username"
                type={EFieldType.USERNAME}
                onChange={(event) => handleInputChange("username", event)}
              />
            </div>
            <div className="input-field">
              <LoginField
                id="password"
                name="password"
                placeholder="Password"
                type={EFieldType.PASSWORD}
                onChange={(event) => handleInputChange("password", event)}
              />
            </div>
            <div
              className={
                warningMessage === " "
                  ? "warning-message omit"
                  : "warning-message"
              }
            >
              <p>{warningMessage}</p>
            </div>
            <div className="form-btn">
              <LoginBtn
                className="login-btn"
                text={formType === EFormType.login ? "Login" : "Signup"}
                type={"submit"}
              />
            </div>
          </form>
        </div>
      </div>
      {props.children}
    </div>
  );
};

export default LoginBox;
