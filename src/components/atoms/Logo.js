import React from "react";
import appLogo from "../../assets/digistore_deliveries_logo.png";

const Logo = ({ ...props }) => {
  return <img {...props} src={appLogo} alt="logo" />;
};

export default Logo;
