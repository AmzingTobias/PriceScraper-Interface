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
        className="text-2xl p-2.5 rounded-md w-full
        bg-gray-800 text-neutral-200
        box-border outline-none
        border-green-500 border-solid border-4
        hover:border-neutral-200
        focus:border-neutral-200
        invalid:border-red-500"
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
