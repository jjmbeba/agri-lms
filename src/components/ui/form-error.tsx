type Props = {
  message: string;
};

const FormError = ({ message }: Props) => {
  return <div className="text-red-500 text-xs">{message}</div>;
};

export default FormError;
