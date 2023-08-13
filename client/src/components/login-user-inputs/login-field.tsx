import "./login-field.css";

export enum EFieldType {
  PASSWORD = "password",
  USERNAME = "text",
}

interface ILoginFieldProps {
  placeholder: string;
  id: string;
  name: string;
  type: EFieldType;
  onChange?: (value: string) => void;
}

const LoginField: React.FC<ILoginFieldProps> = (props) => {
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (props.onChange) {
      props.onChange(event.target.value);
    }
  };

  return (
    <>
      <input
        type={String(props.type)}
        className="login-input input"
        name={props.name}
        id={props.id}
        placeholder={props.placeholder}
        onChange={handleInputChange}
        required
      />
    </>
  );
};

export default LoginField;
