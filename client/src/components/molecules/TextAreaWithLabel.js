import React from "react";
import { getClassesString } from "../../utils";
import TextArea from "../atoms/TextArea";

const TextAreaWithLabel = React.forwardRef(
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
        <TextArea {...props} ref={ref} inputClasses={inputClasses} />
      </>
    );
  }
);

export default TextAreaWithLabel;
