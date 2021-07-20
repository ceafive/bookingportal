import React from "react";

const Header = ({ children }) => {
  return (
    <div className="fixed top-0 left-0 w-full h-[80px] bg-white shadow-md">
      {children}
    </div>
  );
};

export default Header;
