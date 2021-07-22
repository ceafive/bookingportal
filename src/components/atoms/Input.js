import React from "react";
import { getClassesString } from "../../utils";

const Input = React.forwardRef(
  ({ inputClasses, type = "text", placeholder = "1234", ...props }, ref) => {
    return (
      <input
        className={`border-0 px-3 py-3 placeholder-gray-500 text-black bg-white rounded shadow focus:outline-none focus:ring-1 w-full ease-linear transition-all duration-150 ${getClassesString(
          inputClasses
        )}`}
        type={type}
        placeholder={placeholder}
        {...props}
        ref={ref}
      />
    );
  }
);

export default Input;
