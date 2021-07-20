import React from "react";
import { getClassesString } from "../../utils";

const ErrorMessage = ({ text, classes, ...props }) => {
  return (
    <p
      className={`text-sm text-red-500 ${getClassesString(classes)}`}
      {...props}
    >
      {text}
    </p>
  );
};

export default ErrorMessage;
