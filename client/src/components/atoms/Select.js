import React from "react";
import { getClassesString } from "../../utils";

const Select = React.forwardRef(
  ({ data = [], parentClasses, selectClasses, ...props }, ref) => {
    return (
      <div className={`relative ${getClassesString(parentClasses)}`}>
        <select
          className={`block appearance-none w-full border border-gray-500 text-gray-900 py-3 rounded focus:outline-none bg-white ${getClassesString(
            selectClasses
          )}`}
          {...props}
          ref={ref}
        >
          {data.map((option) => {
            return (
              <option
                key={option.name}
                value={option.value}
                disabled={option?.disabled || false}
                {...option.props}
              >
                {option.name}
              </option>
            );
          })}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-300">
          <svg
            className="fill-current h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
    );
  }
);

export default Select;
