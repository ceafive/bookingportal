import axios from "axios";
import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useApp } from "../../ctx/App";
import Button from "../atoms/Button";
import ErrorMessage from "../atoms/ErrorMessage";
import Input from "../atoms/Input";
import InputWithLabel from "../molecules/InputWithLabel";
import Label from "../molecules/Label";
import TextAreaWithLabel from "../molecules/TextAreaWithLabel";
import CollectMomo from "../organisams/CollectMomo";
import {
  isValid,
  isExpirationDateValid,
  isSecurityCodeValid,
  getCreditCardNameByNumber,
} from "creditcard.js";
import { iPayJS } from "../../utils";
import { pick } from "lodash";
import toast from "react-hot-toast";
import ButtonSpinner from "../molecules/ButtonSpinner";

import qrPayLogo from "../../assets/ipay-mvisamasterpass-qr.png";

const paymentOptions = {
  VISAG: "Visa and Mastercard",
  MTNMM: "MTN Mobile Money",
  TIGOC: "AirtelTigo Money",
  VODAC: "Vodafone Cash",
  QRPAY: "GhQR, mVISA and Masterpass",
};

function sortFunc(a, b) {
  const sortingArr = [
    "MTN Mobile Money",
    "Vodafone Cash",
    "AirtelTigo Money",
    "GhQR, mVISA and Masterpass",
    "Visa and Mastercard",
  ];
  return sortingArr.indexOf(a.label) - sortingArr.indexOf(b.label);
}

const statusCheckTotalRunTime = 30000;

const Payment = () => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    getValues,
    control,
    formState: { errors },
  } = useForm();

  const paymentOption = watch("paymentOption");

  const {
    state: {
      activePayments,
      provider: { providerMerchantDetails, providerDetails },
      clientBookingDetails: {
        bookingResponse,
        transactionChargeDetails,
        processPaymentData,
      },
    },
    actions: {
      setComponentToRender,
      setActivePayments,
      setClientBookingDetails,
    },
  } = useApp();

  const [loading, setLoading] = useState(false);
  const [fetchingDeliveryCharge, setFetchingDeliveryCharge] =
    React.useState(true);
  const [showQRCode, setShowQRCode] = useState(false);
  const [processButtonText, setProcessButtonText] = useState("Process Payment");

  React.useEffect(() => {
    const transformed = providerMerchantDetails[`merchant_permissions`]
      .filter(
        (dataactivepayment) =>
          ![`CASH`, `INVPAY`, `ACTDBT`].includes(dataactivepayment)
      )
      .map((dataactivepayment) => {
        return {
          name: dataactivepayment,
          label: paymentOptions[dataactivepayment],
        };
      });

    const newTransformed = [...transformed];

    newTransformed.sort(sortFunc);
    setActivePayments(newTransformed);
  }, [providerMerchantDetails, setActivePayments]);

  useEffect(() => {
    if (paymentOption) {
      const data = {
        channel: paymentOption,
        amount: bookingResponse["payment-amount"],
        merchant: providerDetails?.store_merchant,
      };

      // console.log(data);

      (async () => {
        setLoading(true);
        const res = await axios.post("/api/transaction-fees", data);
        let resData = res?.data ?? {};
        // console.log(resData);

        if (Number(resData?.status) === 0) {
          setClientBookingDetails({
            transactionChargeDetails: pick(resData, [
              "amount",
              "charge",
              "total",
              "service",
            ]),
          });
          setFetchingDeliveryCharge(false);
          setLoading(false);
        }
      })();
    }
  }, [
    bookingResponse,
    paymentOption,
    providerDetails?.store_merchant,
    setClientBookingDetails,
  ]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      iPayJS(window);
    }
  }, [typeof window]);

  const getCardYears = () => {
    const currentYear = new Date().getFullYear();
    const range = (start, stop, step) =>
      Array.from(
        { length: (stop - start) / step + 1 },
        (_, i) => start + i * step
      );
    const result = range(currentYear, currentYear + 9, 1);
    // console.log(result);
    return result;
  };

  const verifyTransaction = async (firstTimeStarted, interval) => {
    try {
      setLoading(true);

      const getResData = async () => {
        const data = {
          merchantKey: providerDetails?.store_merchant,
          trxID: bookingResponse["payment-invoice"],
        };

        const { data: resData } = await axios.post(
          "/api/verify-transaction",
          data
        );
        return resData;
      };

      const data = await getResData();
      const { message } = data;
      // console.log({ message });

      const messages = {
        new: `You will be notified via Email/SMS once your payment is confirmed.&nbsp&nbsp<br><br><b>Thank You for using iPay</b>`,
        awaiting_payment: `You will be notified via Email/SMS once your payment is confirmed.&nbsp&nbsp<br><br><b>Thank You for using iPay</b>`,
        paid: `Payment confirmed successfully for your booking.<br>You will receive a confirmation Email/SMS with your booking number shortly&nbsp&nbsp<br><br><b></b>`,
        failed: `Oops! Payment for your booking request Failed.<br>Booking will not be processed.&nbsp&nbsp<br><br><b>Thank You for using iPay</b>`,
        cancelled: `Oops! Payment for your booking request Cancelled.<br>Booking will not be processed.&nbsp&nbsp<br><br><b>Thank You for using iPay</b>`,
      };

      // console.log(Date.now() - firstTimeStarted > statusCheckTotalRunTime);

      if (message === "new" || message === "awaiting_payment") {
        if (Date.now() - firstTimeStarted > statusCheckTotalRunTime) {
          setClientBookingDetails({
            verifyTransactionResponse: {
              errorMessage: messages[message],
              displayText: "Your booking is pending confirmation.",
              displaySubText: messages[message],
              headerBgColor: "bg-blue-500",
            },
          });
          setLoading(false);
          clearInterval(interval);
          setComponentToRender("booking-confirm");
        }
      } else if (message === "paid") {
        setClientBookingDetails({
          verifyTransactionResponse: {
            errorMessage: messages[message],
            displayText: "Your booking is confirmed.",
            displaySubText: messages[message],
            headerBgColor: "bg-green-500",
          },
        });
        setLoading(false);
        clearInterval(interval);
        setComponentToRender("booking-confirm");
      } else {
        setClientBookingDetails({
          verifyTransactionResponse: {
            errorMessage: messages[message],
            displayText: "Your booking was not successful.",
            displaySubText: messages[message],
            headerBgColor: "bg-red-500",
          },
        });
        setLoading(false);
        clearInterval(interval);
        setComponentToRender("booking-confirm");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const onProcessPayment = async (values) => {
    try {
      if (transactionChargeDetails?.charge) {
        setLoading(true);
        const data = {
          payment_invoice: bookingResponse["payment-invoice"],
          total_amount: Number(
            parseFloat(transactionChargeDetails?.total).toFixed(2)
          ),
          service_charge: Number(
            (Math.round(transactionChargeDetails?.charge * 100) / 100).toFixed(
              2
            )
          ),
          payment_number: ["QRPAY", "VISAG"].includes(values?.paymentOption)
            ? `00000000`
            : values?.paymentNumber,
          payment_network: paymentOption,
          mod_by: "CUSTOMER",
          merchant: providerDetails?.store_merchant,
        };

        // return;
        const res = await axios.post("/api/process-payment", data);
        const resData = res?.data ?? {};
        // return;

        if (Number(resData?.status) !== 0) {
          setLoading(false);
          toast.error(resData?.message);
        } else {
          toast.success(
            <div dangerouslySetInnerHTML={{ __html: resData?.message }} />,
            {
              duration: 5000,
            }
          );

          setClientBookingDetails({
            processPaymentData: resData,
          });

          if (paymentOption === "VISAG") {
            window.gw.ShowOverlay = () => {};
            window.gw.HideOverlay = () => {};

            setTimeout(() => {
              window.gw.Pay(
                "cyb_iframe",
                bookingResponse?.reference,
                {
                  cardType: getValues()?.cardType,
                  cardFirstName: getValues()?.cardFirstName,
                  cardLastName: getValues()?.cardLastName,
                  cardNumber: getValues()?.cardNumber,
                  cardExpiryMonth: getValues()?.cardExpiryMonth,
                  cardExpiryYear: getValues()?.cardExpiryYear,
                  cardCVV: getValues()?.cardCVV,
                },
                () => {
                  setLoading(true);
                  setProcessButtonText("Confirming Payment...");
                  var started = Date.now();
                  var interval = setInterval(() => {
                    verifyTransaction(started, interval);
                  }, 10000);
                }
              );
            }, 2000);
          } else if (paymentOption === "QRPAY") {
            setLoading(true);
            setShowQRCode(true);
            setTimeout(() => {
              setProcessButtonText("Confirming Payment...");
              var started = Date.now();
              var interval = setInterval(() => {
                verifyTransaction(started, interval);
              }, 10000);
            }, 5000);
          } else {
            setLoading(true);
            setTimeout(() => {
              setProcessButtonText("Confirming Payment...");
              var started = Date.now();
              var interval = setInterval(() => {
                verifyTransaction(started, interval);
              }, 10000);
            }, 5000);
          }
        }
      }
    } catch (error) {
      let errorResponse = "";
      if (error.response) {
        errorResponse = error.response.data;
      } else if (error.request) {
        errorResponse = error.request;
      } else {
        errorResponse = { error: error.message };
      }
      console.log(errorResponse);
    } finally {
      // if (paymentOption !== "VISAG") {
      //   setLoading(false);
      // }
    }
  };

  const cancelPayment = async () => {
    try {
      setLoading(true);
      const data = {
        invoice: bookingResponse["payment-invoice"],
        vendor: providerMerchantDetails?.merchant_code,
        status: `cancelled`,
        mod_by: "CUSTOMER",
        mod_date: new Date(),
      };

      const res = await axios.post("/api/cancel-payment", data);
      const resData = res?.data ?? {};

      if (Number(resData?.status) !== 0) {
        toast.error(resData?.message);
      } else {
        setLoading(false);
        setClientBookingDetails({
          bookingPayload: {},
          bookingResponse: {},
          bookingDetails: {},
          transactionChargeDetails: {},
          verifyTransactionResponse: {},
          testSelection: {},
        });
        setComponentToRender("schedule");
      }
    } catch (error) {
      let errorResponse = "";
      if (error.response) {
        errorResponse = error.response.data;
      } else if (error.request) {
        errorResponse = error.request;
      } else {
        errorResponse = { error: error.message };
      }
      console.log(errorResponse);
    } finally {
    }
  };

  return (
    <div className="flex flex-col justify-center items-center w-full max-w-7xl">
      <div className="w-full">
        <div className="flex items-center w-full bg-brandBlue text-white text-xl h-10 pl-2">
          <h1>Booking and Payments System</h1>
        </div>

        <div className="px-5 lg:px-32 py-5">
          <h1 className="text-xl text-brandBlue font-bold">3. Payment</h1>

          <hr className="my-2 border-gray-200 mb-6" />

          <div className={`${`flex`} flex-col w-full h-full`}>
            <div className="flex flex-col px-30px pt-20px mb-45px">
              <div className="mb-5 text-center">
                <p>
                  Payment Invoice No:{" "}
                  <span className="font-bold">
                    {bookingResponse["payment-invoice"]}
                  </span>
                </p>
              </div>
              <div className="mt-15px">
                <Label text={" Select your preferred payment option"} />

                <select
                  {...register("paymentOption", {
                    required: `Select payment option`,
                  })}
                  defaultValue=""
                  className="block w-full px-2 py-3 mb-2 text-sm text-gray-700 bg-white border border-gray-200 rounded focus:outline-none focus:border-black"
                >
                  <option
                    value=""
                    disabled="disabled"
                  >{`Select Option`}</option>
                  {activePayments.map((option, index) => {
                    return (
                      <option key={index} value={option.name}>
                        {option.label}
                      </option>
                    );
                  })}
                </select>
                <ErrorMessage text={errors?.paymentOption?.message} />
              </div>

              {!fetchingDeliveryCharge && (
                <div className="mb-4">
                  <p>
                    Your total fee is{" "}
                    <span className="text-green-500 font-bold">
                      GHS{" "}
                      {parseFloat(transactionChargeDetails?.total).toFixed(2)}
                    </span>
                    .
                    {paymentOption === "VISAG"
                      ? ` Enter your details to complete payment with your VISA or MASTERCARD.`
                      : paymentOption === "CASH"
                      ? ` Cash Payment of GHS${parseFloat(
                          transactionChargeDetails?.total
                        ).toFixed(
                          2
                        )} will be taken from customer upon delivery.`
                      : paymentOption === "QRPAY"
                      ? ` Scan the QR code below to complete payment`
                      : paymentOption === "ACTDBT"
                      ? ` Delivery payment of GHS${parseFloat(
                          transactionChargeDetails?.total
                        ).toFixed(
                          2
                        )} will be charged to your iPay Account Wallet`
                      : ` You will receive a prompt on the mobile money number provided.
                    Enter your PIN to complete payment.`}
                  </p>
                </div>
              )}

              <>
                {["MTNMM", "VODAC", "TIGOC"].includes(paymentOption) ? (
                  <div>
                    <Controller
                      control={control}
                      name="paymentNumber"
                      rules={{
                        required: {
                          value: paymentOption !== "VISAG" ? true : false,
                          message: `Mobile Number is required`,
                          minLength: {
                            value: 10,
                            message: "Phone number must be 10 chars",
                          },
                          maxLength: {
                            value: 10,
                            message: "Phone number must be 10 chars",
                          },
                        },
                      }}
                      render={({ field: { onChange, onBlur, value, ref } }) => (
                        <>
                          <div className="w-full">
                            <Label
                              text={
                                paymentOption === "VISAG"
                                  ? "Phone number or Email address"
                                  : "Mobile Money number"
                              }
                            />
                            <Input
                              inputClasses="!border !border-gray-500 !shadow-none hover:focus:!ring-0"
                              type={
                                paymentOption === "VISAG" ? "text" : "number"
                              }
                              // pattern={"[0-9]*"}
                              noValidate
                              placeholder={
                                paymentOption === "VISAG"
                                  ? "Enter phone number or email address"
                                  : "Enter mobile money number"
                              }
                              {...register(`paymentNumber`, {
                                required: `${
                                  paymentOption === "VISAG"
                                    ? "Enter phone number or email address"
                                    : "Enter mobile money number"
                                }`,
                              })}
                            />
                            <ErrorMessage
                              text={errors?.paymentNumber?.message}
                            />
                          </div>
                        </>
                      )}
                    />
                  </div>
                ) : paymentOption === "VISAG" ? (
                  <div id="card-pay-section">
                    <div id="cyb_iframe_div" className="hidden">
                      <iframe
                        id="cyb_iframe"
                        name="cyb_iframe"
                        className="h-screen w-full"
                        title="card-payment"
                      />
                    </div>

                    <form>
                      <div
                        id="card-pay-details"
                        className="flex flex-wrap justify-between w-full mt-15px"
                      >
                        <div className="w-full mb-2">
                          <Label text={" Card Type"} />
                          <select
                            id="gw_card_type"
                            defaultValue=""
                            {...register("cardType", {
                              required: {
                                value: paymentOption === "VISAG" ? true : false,
                                message: `Please select the card type to use`,
                              },
                            })}
                            className="block w-full h-12 px-2 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded focus:outline-none focus:border-black"
                          >
                            <option value="" disabled="disabled">
                              Select card type
                            </option>
                            <option value="001">Visa</option>
                            <option value="002">Mastercard</option>
                          </select>
                          <ErrorMessage text={errors?.cardType?.message} />
                        </div>

                        <div className="mb-2" style={{ width: "48%" }}>
                          <Label text={"First Name"} />
                          <Input
                            inputClasses="!border !border-gray-500 !shadow-none hover:focus:!ring-0"
                            id="gw_card_first_name"
                            type="text"
                            placeholder=""
                            {...register("cardFirstName", {
                              required: {
                                value: paymentOption === "VISAG" ? true : false,
                                message: `First name is required`,
                              },
                            })}
                            autoComplete="off"
                          />
                          <ErrorMessage text={errors?.cardFirstName?.message} />
                        </div>

                        <div className="mb-2" style={{ width: "48%" }}>
                          <Label text={"Last Name"} />
                          <Input
                            inputClasses="!border !border-gray-500 !shadow-none hover:focus:!ring-0"
                            id="gw_card_last_name"
                            type="text"
                            placeholder=""
                            {...register("cardLastName", {
                              required: {
                                value: paymentOption === "VISAG" ? true : false,
                                message: `Last name is required`,
                              },
                            })}
                            autoComplete="off"
                          />
                          <ErrorMessage text={errors?.cardLastName?.message} />
                        </div>

                        <div className="w-full  mb-2">
                          <Label text={"Card Number"} />
                          <Input
                            inputClasses="!border !border-gray-500 !shadow-none hover:focus:!ring-0"
                            id="gw_card_number"
                            type="number"
                            placeholder=""
                            {...register("cardNumber", {
                              required: {
                                value: paymentOption === "VISAG" ? true : false,
                                message: `Card number is required`,
                              },
                              validate: {
                                isValidNumber: (value) => {
                                  const newValue = value.replace(/\s+/g, "");
                                  return (
                                    isValid(newValue) || `Invalid Card Number`
                                  );
                                },
                                isValidNumberForCardSelected: (value) => {
                                  const newValue = value.replace(/\s+/g, "");
                                  const values = getValues();
                                  const cardtype =
                                    values?.cardType === "001"
                                      ? "visa"
                                      : "mastercard";
                                  const getCardType =
                                    getCreditCardNameByNumber(newValue);

                                  return (
                                    getCardType.toLowerCase() === cardtype ||
                                    `Invalid Card Type selected for card number provided`
                                  );
                                },
                              },
                            })}
                            autoComplete="off"
                          />
                          {/* <input id="gw_card_number" type="hidden" autoComplete="off" /> */}
                          <ErrorMessage text={errors?.cardNumber?.message} />
                        </div>

                        <div className="mb-2" style={{ width: "48%" }}>
                          <Label text={"Expiry Month"} />

                          <select
                            id="gw_card_expire_month"
                            defaultValue=""
                            {...register("cardExpiryMonth", {
                              required: {
                                value: paymentOption === "VISAG" ? true : false,
                                message: `Expiry month is required`,
                              },
                              isValidNumber: () => {
                                const values = getValues();
                                const cardExpiryMonth = values?.cardExpiryMonth;
                                const cardExpiryYear = values?.cardExpiryYear;

                                return (
                                  isExpirationDateValid(
                                    cardExpiryMonth,
                                    cardExpiryYear
                                  ) || `Invalid Card expiry date`
                                );
                              },
                            })}
                            className="block w-full px-2 py-3 mb-2 text-sm text-gray-700 bg-white border border-gray-200 rounded focus:outline-none focus:border-black"
                          >
                            <option value="" disabled="disabled">
                              MM
                            </option>
                            <option value="01">01</option>
                            <option value="02">02</option>
                            <option value="03">03</option>
                            <option value="04">04</option>
                            <option value="05">05</option>
                            <option value="06">06</option>
                            <option value="07">07</option>
                            <option value="08">08</option>
                            <option value="09">09</option>
                            <option value="10">10</option>
                            <option value="11">11</option>
                            <option value="12">12</option>
                          </select>
                          <ErrorMessage
                            text={errors?.cardExpiryMonth?.message}
                          />
                        </div>

                        <div className="mb-2" style={{ width: "48%" }}>
                          <Label text={"Expiry Year"} />

                          <select
                            id="gw_card_expire_year"
                            defaultValue=""
                            {...register("cardExpiryYear", {
                              required: {
                                value: paymentOption === "VISAG" ? true : false,
                                message: `Expiry year is required`,
                              },
                              isValidNumber: () => {
                                const values = getValues();
                                const cardExpiryMonth = values?.cardExpiryMonth;
                                const cardExpiryYear = values?.cardExpiryYear;

                                return (
                                  isExpirationDateValid(
                                    cardExpiryMonth,
                                    cardExpiryYear
                                  ) || `Invalid Card expiry date`
                                );
                              },
                            })}
                            className="block w-full px-2 py-3 mb-2 text-sm text-gray-700 bg-white border border-gray-200 rounded focus:outline-none focus:border-black"
                          >
                            <option value="" disabled="disabled">
                              YYYY
                            </option>
                            {getCardYears().map((year, index) => (
                              <option key={index} value={year}>
                                {year}
                              </option>
                            ))}
                          </select>
                          <ErrorMessage
                            text={errors?.cardExpiryYear?.message}
                          />
                        </div>

                        <div className="w-2/5 mb-2">
                          <Label text={"CVV"} />

                          <Input
                            inputClasses="!border !border-gray-500 !shadow-none hover:focus:!ring-0"
                            id="gw_card_cvn"
                            type="text"
                            placeholder=""
                            {...register("cardCVV", {
                              required: {
                                value: paymentOption === "VISAG" ? true : false,
                                message: `CVV is required`,
                              },

                              validate: {
                                isValidNumber: (value) => {
                                  const newValue = value.replace(/\s+/g, "");
                                  const values = getValues();
                                  const cardNumber = values?.cardNumber.replace(
                                    /\s+/g,
                                    ""
                                  );

                                  return (
                                    isSecurityCodeValid(cardNumber, newValue) ||
                                    `Invalid security code`
                                  );
                                },
                              },
                            })}
                            autoComplete="off"
                            maxLength="3"
                            minLength="3"
                          />
                          <ErrorMessage text={errors?.cardCVV?.message} />
                        </div>
                      </div>
                    </form>
                  </div>
                ) : paymentOption === "QRPAY" ? (
                  <>
                    <div className="p-5 text-sm text-center text-white bg-brandBlue rounded">
                      <div id="qr-pay-section">
                        <div className="text-center">
                          <h5 id="card-pay-title " className="text-white">
                            <ion-icon name="lock-closed-outline"></ion-icon>

                            <span className="ml-1">SECURE QR PAYMENT</span>
                          </h5>
                          <hr className="my-2" />
                        </div>
                        <div id="box" className="">
                          Please wait whilst we launch a secure QR Code for you
                          to scan and pay with your{" "}
                          <b>
                            bank's mobile-app that supports GhQR, mVisa and
                            Masterpass
                          </b>
                          .
                        </div>
                      </div>

                      {showQRCode && (
                        <div className="flex flex-col items-center w-full mt-5">
                          <p className="font-bold text-center">Instructions</p>
                          <img
                            className="text-center"
                            src={qrPayLogo}
                            alt="qr-logo"
                          />
                          <p
                            className="p-5 text-sm text-center rounded"
                            dangerouslySetInnerHTML={{
                              __html: processPaymentData?.message,
                            }}
                          />
                          <img
                            className="text-center"
                            src={processPaymentData?.qr}
                            alt="qr-code"
                          />
                          <p className="p-5 text-sm text-center !text-white bg-brandBlue rounded">
                            We will automatically confirm payment
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <></>
                )}
              </>
            </div>

            <div className="mt-5">
              <div className="flex justify-between w-full">
                <button
                  disabled={loading}
                  className={`${
                    loading ? "bg-gray-300" : "bg-red-500"
                  } capitalize font-medium w-3/12 text-white  py-3 rounded`}
                  onClick={async () => {
                    await cancelPayment();
                  }}
                >
                  Cancel
                </button>

                <button
                  disabled={loading}
                  className={`${
                    loading ? "bg-gray-300" : "bg-brandGreen2 "
                  } capitalize font-medium w-8/12 lg:w-1/3 text-white py-3  rounded`}
                  onClick={handleSubmit(onProcessPayment)}
                >
                  {processButtonText}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
