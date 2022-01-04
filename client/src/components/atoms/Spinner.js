import Loader from "react-loader-spinner";

const Spinner = ({
  type = "TailSpin",
  color = "#000",
  height = 50,
  width = 50,
  timeout = 3000000,
}) => {
  return (
    <Loader
      type={type}
      color={color}
      height={height}
      width={width}
      timeout={timeout}
    />
  );
};

export default Spinner;
