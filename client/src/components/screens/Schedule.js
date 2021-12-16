import React from "react";

const Schedule = () => {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen max-h-screen w-full max-w-7xl">
      <div className="w-full">
        <div className="flex items-center w-full bg-brandBlue text-white text-xl h-10 pl-2">
          <h1>Booking and Payments System</h1>
        </div>

        <div className="px-32 py-5">
          <h1 className="text-xl text-brandBlue font-bold">
            1. Choose Type of Test
          </h1>

          <hr className="my-2 border-gray-200" />

          <div className="px-32 py-5">
            <div className="bg-gray-300 p-5">
              <div className="flex justify-between w-full">
                <div>
                  <h1 className="font-bold">Test Type A</h1>
                  <h1>Detailed Test Descrtiption</h1>
                </div>
                <div>
                  <h1 className="font-bold">GHS 100</h1>
                </div>
              </div>

              <div className="flex justify-between w-full">
                <div>
                  <p>Monday: 8:30AM to 2:00PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;
