import React from "react";
import { getClassesString } from "../../utils";
import Input from "../atoms/Input";

const InputWithLabel = React.forwardRef(
  ({ labelText = "", labelClasses, inputClasses, ...props }, ref) => {
    return (
      <>
        <label
          className={`block uppercase text-black text-xs font-bold mb-1 ${getClassesString(
            labelClasses
          )}`}
        >
          {labelText}
        </label>
        <Input {...props} ref={ref} inputClasses={inputClasses} />
      </>
    );
  }
);

export default InputWithLabel;
