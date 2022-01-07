import React, { useRef } from "react";
import { useApp } from "../../ctx/App";
import Button from "../atoms/Button";
import { useReactToPrint } from "react-to-print";

const paymentOptions = {
  VISAG: "Visa and Mastercard",
  MTNMM: "MTN Mobile Money",
  TIGOC: "AirtelTigo Money",
  VODAC: "Vodafone Cash",
  QRPAY: "GhQR, mVISA and Masterpass",
};

const BookingConfirm = () => {
  const {
    state: {
      clientBookingDetails: {
        bookingPayload,
        bookingResponse,
        bookingDetails,
        transactionChargeDetails,
        verifyTransactionResponse,
        testSelection,
      },
    },
    actions: { setComponentToRender, setClientBookingDetails },
  } = useApp();

  // console.log({
  //   bookingPayload,
  //   bookingResponse,
  //   bookingDetails,
  //   transactionChargeDetails,
  //   verifyTransactionResponse,
  //   testSelection,
  // });

  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  return (
    <div className="flex flex-col justify-center items-center w-full max-w-7xl">
      <div className="w-full">
        <div className="flex items-center w-full bg-brandBlue text-white text-xl h-10 pl-2">
          <h1>Booking and Payments System</h1>
        </div>

        <div className="px-3 lg:px-32 py-5">
          <h1 className="text-xl text-brandBlue font-bold">
            Booking Confirmation
          </h1>

          <hr className="my-2 border-gray-200 mb-5" />

          <div ref={componentRef} className="lg:px-32 py-5">
            <div
              className={`${verifyTransactionResponse?.headerBgColor} text-white p-5 border border-gray-100 rounded`}
            >
              <h1 className="font-bold">
                {verifyTransactionResponse?.displayText}
              </h1>

              <p
                className=""
                dangerouslySetInnerHTML={{
                  __html: verifyTransactionResponse?.displaySubText,
                }}
              />
            </div>

            <div className="bg-gray-50 p-3 lg:p-5 border border-gray-200 rounded mt-5">
              <h1>{"Customer Information"}</h1>
              <div className="flex">
                <div className="mt-4 w-1/2">
                  <p className="font-bold text-xs">Contact Information</p>

                  <p className="my-3">{bookingDetails?.email}</p>

                  <div className="p-1">
                    <p className="font-bold text-sm">Client Information</p>
                    <p className="my-1">{bookingDetails?.studentName}</p>
                    <p className="my-1">{bookingDetails?.uniName}</p>
                    <p className="my-1">{bookingDetails?.studentIDNumber}</p>
                    <p className="my-1">{bookingDetails?.phone}</p>
                    <p className="my-1">{bookingDetails?.studentRegion}</p>
                  </div>
                </div>

                <div className="mt-4 w-1/2">
                  <p className="font-bold text-xs">Payment Method</p>
                  <p className="my-3">
                    {paymentOptions[transactionChargeDetails["service"]]}
                  </p>

                  <div className="p-1">
                    <p className="font-bold text-sm">Booking Information</p>
                    <p className="my-1">{bookingResponse["payment-invoice"]}</p>
                    <p className="my-1">{testSelection?.product_name}</p>
                    <p className="my-1">
                      {bookingDetails?.bookingDate} -{" "}
                      {bookingDetails?.bookingTime}
                    </p>
                    <p className="mt-3 my-1">
                      {"GHS"} {testSelection?.product_price}
                    </p>

                    <div className="flex justify-between items-center mt-4 lg:w-2/3 print:hidden">
                      <button className={`text-blue-500`} onClick={handlePrint}>
                        Print
                      </button>

                      <a
                        // href={`whatsapp://send?abid=&text=Hello%2C%20World!`}
                        href={`https://api.whatsapp.com/send?phone=233${
                          bookingDetails?.phone
                        }&text=${`
                        
                          Booking Information
                          ----------------------
                          Invoice Number: ${bookingResponse["payment-invoice"]}\n\n
                          Name of Test: ${testSelection?.product_name}\n
                          Date/Time: ${bookingDetails?.bookingDate} - ${bookingDetails?.bookingTime}\n
                          Amount: GHS${testSelection?.product_price}\n

                          Client Information
                          ----------------------
                          Email: ${bookingDetails?.email}\n
                          Name: ${bookingDetails?.studentName}\n
                          Name of University: ${bookingDetails?.uniName}\n
                          Student ID Number: ${bookingDetails?.studentIDNumber}\n
                          Phone Number: ${bookingDetails?.phone}\n
                          Region of Residence: ${bookingDetails?.studentRegion}\n
                        
                        `}`}
                        target="_blank"
                        rel="noreferrer"
                        className={`text-blue-500`}
                      >
                        Send To Whatsapp
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 print:hidden">
              <div className="flex justify-center w-full">
                <button
                  className={`${"bg-brandGreen2 "} capitalize font-medium w-1/3 text-white py-3 rounded`}
                  onClick={() => {
                    setClientBookingDetails({
                      bookingPayload: {},
                      bookingResponse: {},
                      bookingDetails: {},
                      transactionChargeDetails: {},
                      verifyTransactionResponse: {},
                      testSelection: {},
                    });
                    setComponentToRender("schedule");
                  }}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirm;
