import React from "react";
import { useApp } from "../../ctx/App";
import Button from "../atoms/Button";

const LandingPage = ({}) => {
  const {
    state: { componentToRender },
    actions: { setComponentToRender },
  } = useApp();

  return (
    <div className="w-full">
      <div
        className="flex flex-col justify-center items-center w-full h-[90px] sm:h-[65vh] md:h-[65vh] lg:h-[65vh] xl:h-[65vh] overflow-hidden mt-5"
        style={{
          backgroundImage: `url(${"https://images.unsplash.com/photo-1582719366767-dbbb6c6bf4aa?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80"})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="flex flex-col justify-center items-center  w-5/12 text-center">
          <div className="flex flex-col justify-center items-center bg-[#21428F] text-white px-5 py-1 text-center">
            <h1 className="font-bold mb-5 text-xl">COVID-19 TESTING</h1>

            <p className="my-2 text-gray-200">
              Noguchi Memorial Institute provides fast and convenient COVID-19
              testing – Results in 48 – 72hours{" "}
            </p>
            <p className="my-2 text-gray-200">
              Click the button below to schedule and pay for your COVID test
              appointment
            </p>
          </div>
        </div>

        <div className="mt-5">
          <Button
            btnText={"Schedule Here"}
            btnClasses={"bg-[#4AB647] text-white uppercase"}
            onClick={() => {
              setComponentToRender("schedule");
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
