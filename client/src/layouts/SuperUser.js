import React from "react";
import Header from "../components/molecules/Header";

const SuperUser = ({ component }) => {
  return (
    <div className="min-h-screen w-full">
      <Header />
      {component}
    </div>
  );
};

export default SuperUser;
