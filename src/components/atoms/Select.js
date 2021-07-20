import React from "react";
import { getClassesString } from "../../utils";

const Select = React.forwardRef(
  ({ data = [], selectClasses, ...props }, ref) => {
    return (
      <select
        className={`block w-full border border-gray-200 text-gray-700 py-2 rounded focus:outline-none text-sm bg-white mb-2  ${getClassesString(
          selectClasses
        )}`}
        {...props}
        ref={ref}
      >
        {data.map((option) => {
          return (
            <option key={option.name} value={option.value} {...option.props}>
              {option.name}
            </option>
          );
        })}
      </select>
    );
  }
);

export default Select;
