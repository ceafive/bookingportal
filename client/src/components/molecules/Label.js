import React from "react";
import { getClassesString } from "../../utils";

const Label = ({ text, labelClasses, ...props }) => {
  return (
    <label
      className={`block uppercase text-black text-xs font-bold mb-1 ${getClassesString(
        labelClasses
      )}`}
      {...props}
    >
      {text}
    </label>
  );
};

export default Label;
