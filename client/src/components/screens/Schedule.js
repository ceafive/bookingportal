import React from "react";
import { useApp } from "../../ctx/App";
import Button from "../atoms/Button";

const openingDurations = [
  {
    day: "Monday",
    times: "8:00AM to 6:00PM",
  },
  {
    day: "Tuesday",
    times: "8:00AM to 6:00PM",
  },
  {
    day: "Wednesday",
    times: "8:00AM to 6:00PM",
  },
  {
    day: "Thursday",
    times: "8:00AM to 6:00PM",
  },
  {
    day: "Friday",
    times: "8:00AM to 6:00PM",
  },
  {
    day: "Saturday",
    times: "8:00AM to 6:00PM",
  },
];

const Schedule = () => {
  const {
    state: {
      provider: { providerMerchantDetails, providerProducts },
    },
    actions: { setComponentToRender, setClientBookingDetails },
  } = useApp();

  // console.log(providerProducts);

  return (
    <div className="flex flex-col justify-center items-center w-full max-w-7xl">
      <div className="w-full">
        <div className="flex items-center w-full bg-brandBlue text-white text-xl h-10 pl-2">
          <h1>Booking and Payments System</h1>
        </div>

        <div className="px-3 lg:px-32 py-3">
          <h1 className="text-xl text-brandBlue font-bold">
            1. Choose Type of Test
          </h1>

          <hr className="my-2 border-gray-200 mb-5" />

          {providerProducts.map((x, i) => {
            return (
              <div key={i} className="px-3 lg:px-32 py-3">
                <div className="bg-gray-100 p-5 rounded">
                  <div className="flex justify-between">
                    <div className="">
                      <h1 className="font-bold">{x?.product_name}</h1>
                    </div>
                    <div>
                      <h1 className="font-bold">
                        {providerMerchantDetails?.merchant_currency || "GHS"}{" "}
                        {"  "}
                        {x?.product_price}
                      </h1>
                    </div>
                  </div>

                  <div className="mb-5 mt-2">
                    <h1>{x?.product_description}</h1>
                  </div>

                  <div className="lg:flex lg:justify-between mt-3 text-gray-600 ">
                    <div>
                      {openingDurations.slice(0, 3).map((x, i) => {
                        return (
                          <p key={i}>
                            {x?.day}: {x?.times}
                          </p>
                        );
                      })}
                    </div>

                    <div className="lg:flex justify-between items-end">
                      <div className="mr-4">
                        {openingDurations.slice(3, 6).map((x, i) => {
                          return (
                            <p key={i}>
                              {x?.day}: {x?.times}
                            </p>
                          );
                        })}
                      </div>

                      <div className="flex justify-center">
                        <Button
                          btnText={"SELECT"}
                          btnClasses={
                            "bg-[#4AB647] text-white uppercase !py-2 !w-auto mt-3 lg:mt-0"
                          }
                          onClick={() => {
                            setClientBookingDetails({
                              testSelection: {
                                idx: i,
                                ...x,
                              },
                            });
                            setComponentToRender("book");
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Schedule;
