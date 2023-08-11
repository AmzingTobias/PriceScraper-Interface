import { ReactNode, useState } from "react";
import "./login-box.css";

interface IContextBoxProps {
  children: ReactNode;
  style?: React.CSSProperties;
}

enum EFormType {
  login,
  signup,
}

const ContentBox: React.FC<IContextBoxProps> = (props) => {
  const [formType, setFormType] = useState<EFormType>(EFormType.login);
  const loginFormTypeClassNames =
    "mode-btn btn " + (formType === EFormType.login ? "active" : "inactive");
  const signupFormTypeClassNames =
    "mode-btn btn " + (formType === EFormType.signup ? "active" : "inactive");

  const toggleFormType = (formToChangeTo: EFormType) => {
    if (formToChangeTo !== formType) {
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
        <div className="bottom-div"></div>
      </div>
      {props.children}
    </div>
  );
};

export default ContentBox;
