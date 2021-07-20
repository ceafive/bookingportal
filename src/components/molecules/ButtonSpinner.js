import React from "react";
import { getClassesString } from "../../utils";
import Spinner from "../atoms/Spinner";

const ButtonSpinner = ({
  processing,
  btnText,
  btnClasses,
  spinnerProps,
  ...props
}) => {
  return (
    <button
      disabled={processing}
      className={`${
        processing ? "bg-gray-300 text-gray-200" : "bg-green-800 text-white"
      } active:bg-green-600 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full ease-linear transition-all duration-150 ${getClassesString(
        btnClasses
      )}`}
      {...props}
    >
      {processing && (
        <div className="inline-block mr-2">
          <Spinner
            type={"TailSpin"}
            color="black"
            width="10"
            height="10"
            {...spinnerProps}
          />
        </div>
      )}
      <span>{btnText}</span>
    </button>
  );
};

export default ButtonSpinner;
