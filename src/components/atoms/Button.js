import React from "react";
import { getClassesString } from "../../utils";

const Button = ({ btnText, btnClasses, ...props }) => {
  return (
    <button
      className={`text-sm px-6 py-3 rounded shadow outline-none focus:outline-none w-full ease-linear transition-all duration-150 ${getClassesString(
        btnClasses
      )}`}
      {...props}
    >
      {btnText}
    </button>
  );
};

export default Button;
