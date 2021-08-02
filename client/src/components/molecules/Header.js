import React from "react";

const Header = ({ children }) => {
  return (
    <div className="items-center fixed top-0 left-0 w-full h-[90px] bg-white shadow-md z-50">
      {children}
    </div>
  );
};

export default Header;
