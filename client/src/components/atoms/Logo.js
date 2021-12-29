import React from "react";
import appLogo from "../../assets/digistore_deliveries_logo.png";

const Logo = ({ src, ...props }) => {
  return <img {...props} src={src} alt="logo" />;
};

export default Logo;
