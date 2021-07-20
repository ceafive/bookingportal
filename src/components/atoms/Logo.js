import React from "react";

const Logo = ({ ...props }) => {
  return (
    <img
      {...props}
      src="https://sell.digistoreafrica.com/wp-content/uploads/2021/03/DigiStore-Logo-Color.png"
      alt="logo"
    />
  );
};

export default Logo;
