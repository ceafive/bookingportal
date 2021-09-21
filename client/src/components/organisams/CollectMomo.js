import axios from "axios";
import React from "react";
import { useApp } from "../../ctx/App";
import { useAuth } from "../../ctx/Auth";
import Button from "../atoms/Button";
import Input from "../atoms/Input";
import Select from "../atoms/Select";
import ButtonSpinner from "../molecules/ButtonSpinner";
import Label from "../molecules/Label";
import toast from "react-hot-toast";
import { capitalize, upperCase } from "lodash";

const CollectMomo = ({
  register,
  errors,
  watch,
  handleSubmit,
  setStep,
  setValue,
  getValues,
  fetching,
  statusText,
  setFetching,
  setStatusText,
  setConfirmButtonText,
  setProcessError,
}) => {
  const {
    state: { user },
  } = useAuth();

  const {
    state: { activePayments },
  } = useApp();

  const [fetchingDeliveryCharge, setFetchingDeliveryCharge] =
    React.useState(true);
  const [deliveryCharge, setDeliveryCharge] = React.useState(0);
  const paymentOption = watch("paymentOption");

  React.useEffect(() => {
    if (paymentOption) {
      let { deliveryEstimate } = getValues();
      deliveryEstimate = JSON.parse(deliveryEstimate);

      const { user_merchant_id } = user;

      const data = {
        channel: paymentOption,
        amount: deliveryEstimate?.price,
        merchant: user_merchant_id,
      };

      (async () => {
        const res = await axios.post("/api/transaction-fees", data);
        const resData = res?.data ?? {};

        // console.log(resData);
        setDeliveryCharge(resData);
        setValue("totalAmount", resData);
        setFetchingDeliveryCharge(false);
      })();
    }
  }, [getValues, paymentOption, setValue, user]);

  const onProcessPayment = async (values) => {
    try {
      setFetching(true);
      const data = {
        payment_invoice: statusText?.invoice,
        // total_amount: 0.1,
        total_amount: values?.totalAmount?.total,
        service_charge: values?.totalAmount?.charge,
        // payment_type: values?.paymentOption === "VISAG" ? "CARD" : "MOMO",
        payment_number:
          values?.paymentOption === "CASH" || values?.paymentOption === "ACTDBT"
            ? user?.user_merchant_phone
            : values?.momoNumberOrEmailAddress,
        payment_network: values?.paymentOption,
        mod_by: user?.login,
        merchant: user?.user_merchant_id,
      };

      // console.log(data);
      // return;

      const res = await axios.post("/api/process-payment", data);
      const resData = res?.data ?? {};
      console.log(resData);

      if (Number(resData?.status) !== 0) {
        if (
          values?.paymentOption === "CASH" ||
          values?.paymentOption === "ACTDBT"
        ) {
          setConfirmButtonText("Start New Delivery");
          setProcessError(resData?.message);
          setStep(2);
        } else toast.error(resData?.message);
      } else {
        setStatusText({
          ...statusText,
          invoice: resData?.invoice,
          message: resData?.message,
        });

        if (
          values?.paymentOption === "CASH" ||
          values?.paymentOption === "ACTDBT"
        ) {
          setConfirmButtonText("Start New Delivery");
          setProcessError(resData?.message);
        }
        setStep(2);
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
      setFetching(false);
    }
  };

  const onProcessCardPayment = async (values) => {
    try {
      setFetching(true);
      const data = {
        payment_invoice: statusText?.invoice,
        // total_amount: 1,
        total_amount: values?.totalAmount?.total,
        service_charge: values?.totalAmount?.charge,
        payment_number: `00000000`,
        payment_network: values?.paymentOption,
        mod_by: user?.login,
        merchant: user?.user_merchant_id,
      };

      console.log(data);

      const res = await axios.post("/api/process-payment", data);
      const resData = res?.data ?? {};
      console.log(resData);

      if (Number(resData?.status) !== 0) {
      } else {
        window.gw.Pay("cyb_iframe", resData?.reference, (e) => {
          console.log(e);
        });
      }

      return false;
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
      setFetching(false);
    }
  };

  const cardProps = [
    {
      id: "gw_card_type",
      labelText: "Card Type",
      name: "cardType",
      value: "",
      type: "select",
      optionsData: [
        {
          name: `Visa`,
          value: `Visa`,
        },
        {
          name: `Mastercard`,
          value: `Mastercard`,
        },
      ],
    },
    {
      id: "gw_card_first_name",
      labelText: "First Name",
      name: "firstName",
      value: "",
      type: "input",
    },
    {
      id: "gw_card_last_name",
      labelText: "Last Name",
      name: "lastName",
      value: "",
      type: "input",
    },
    {
      id: "gw_card_number",
      labelText: "Card Number",
      name: "cardNumber",
      value: "",
      type: "input",
    },
    {
      id: "gw_card_cvn",
      labelText: "CVV",
      name: "cvv",
      value: "",
      type: "input",
    },
  ];

  return (
    <div className="w-full">
      <div className="flex flex-col items-center">
        <div className="mb-5">
          <p>
            Delivery Order No:{" "}
            <span className="font-bold">{statusText?.order}</span>
          </p>
          {/* <p>
            Payment Invoice No:{" "}
            <span className="font-bold">{statusText?.invoice}</span>
          </p> */}
        </div>
        <div className="w-10/12">
          <div className="flex flex-col items-center w-full">
            <div className="w-full mb-2 ">
              <Label text="Select your preferred payment option" />
              <Select
                selectClasses="px-2"
                {...register("paymentOption", {
                  required: `Select payment option`,
                })}
                data={[
                  {
                    name: `Select a payment option`,
                    value: "",
                  },
                ].concat(
                  activePayments.map((activePayment) => {
                    return {
                      name: activePayment?.label,
                      value: activePayment?.name,
                    };
                  })
                )}
              />
              {errors[`paymentOption`] && (
                <p className="text-xs text-red-500">
                  {errors[`paymentOption`]?.message}
                </p>
              )}
            </div>

            {paymentOption && (
              <>
                {paymentOption === "VISAG" ? (
                  <>
                    {cardProps.map((cardProp) => {
                      return (
                        <div key={cardProp?.name} className="w-full mt-4">
                          <Label text={cardProp?.labelText} />
                          {cardProp?.type === "select" ? (
                            <Select
                              id={cardProp?.id}
                              selectClasses="px-2"
                              {...register(cardProp?.name, {
                                required: `Select ${capitalize(
                                  upperCase(cardProp?.name)
                                )}`,
                              })}
                              data={cardProp?.optionsData.map((optionData) => {
                                return {
                                  name: optionData?.name,
                                  value: optionData?.value,
                                };
                              })}
                            />
                          ) : (
                            <Input
                              id={cardProp?.id}
                              inputClasses="!border !border-gray-500 !shadow-none hover:focus:!ring-0"
                              placeholder={`Enter ${capitalize(
                                upperCase(cardProp?.name)
                              )}`}
                              {...register(cardProp?.name, {
                                required: `Enter ${capitalize(
                                  upperCase(cardProp?.name)
                                )}`,
                              })}
                            />
                          )}
                          {errors[cardProp?.name] && (
                            <p className="text-xs text-red-500">
                              {errors[cardProp?.name]?.message}
                            </p>
                          )}
                        </div>
                      );
                    })}
                    <div className="w-full mt-4">
                      <Label text={`Expiry Date`} />
                      <div className="flex justify-between items-center w-full">
                        <div className="w-1/2">
                          <Select
                            id="gw_card_expire_month"
                            selectClasses="px-2"
                            {...register(`expiryMonth`, {
                              required: `Select Expiry Month`,
                            })}
                            data={[
                              {
                                name: "MM",
                                value: "",
                              },
                              {
                                name: "01",
                                value: "01",
                              },
                              {
                                name: "02",
                                value: "02",
                              },
                              {
                                name: "03",
                                value: "03",
                              },
                              {
                                name: "04",
                                value: "04",
                              },
                              {
                                name: "05",
                                value: "05",
                              },
                              {
                                name: "06",
                                value: "06",
                              },
                              {
                                name: "07",
                                value: "07",
                              },
                              {
                                name: "08",
                                value: "08",
                              },
                              {
                                name: "09",
                                value: "09",
                              },
                              {
                                name: "10",
                                value: "10",
                              },
                              {
                                name: "11",
                                value: "11",
                              },
                              {
                                name: "12",
                                value: "12",
                              },
                            ].map((optionData) => {
                              return {
                                name: optionData?.name,
                                value: optionData?.value,
                              };
                            })}
                          />
                          {errors[`expiryMonth`] && (
                            <p className="text-xs text-red-500">
                              {errors[`expiryMonth`]?.message}
                            </p>
                          )}
                        </div>
                        <div className="w-1/2">
                          <Select
                            id="gw_card_expire_year"
                            selectClasses="px-2"
                            {...register(`expiryYear`, {
                              required: `Select Expiry Year`,
                            })}
                            data={[
                              {
                                name: "YYYY",
                                value: "",
                              },
                              {
                                name: "2021",
                                value: "2021",
                              },
                              {
                                name: "2022",
                                value: "2022",
                              },
                              {
                                name: "2023",
                                value: "2023",
                              },
                              {
                                name: "2024",
                                value: "2024",
                              },
                              {
                                name: "2025",
                                value: "2025",
                              },
                              {
                                name: "2026",
                                value: "2026",
                              },
                              {
                                name: "2027",
                                value: "2027",
                              },
                              {
                                name: "2028",
                                value: "2028",
                              },
                              {
                                name: "2029",
                                value: "2029",
                              },
                              {
                                name: "2030",
                                value: "2030",
                              },
                              {
                                name: "2031",
                                value: "2031",
                              },
                              {
                                name: "2032",
                                value: "2032",
                              },
                            ].map((optionData) => {
                              return {
                                name: optionData?.name,
                                value: optionData?.value,
                              };
                            })}
                          />
                          {errors[`expiryYear`] && (
                            <p className="text-xs text-red-500">
                              {errors[`expiryYear`]?.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                ) : paymentOption === "CASH" || paymentOption === "ACTDBT" ? (
                  <div className=""></div>
                ) : (
                  <div className="w-full mt-4">
                    <Label
                      text={
                        paymentOption === "VISAG"
                          ? "Phone number or Email address"
                          : "Mobile Money number"
                      }
                    />
                    <Input
                      inputClasses="!border !border-gray-500 !shadow-none hover:focus:!ring-0"
                      type={paymentOption === "VISAG" ? "text" : "number"}
                      // pattern={"[0-9]*"}
                      noValidate
                      placeholder={
                        paymentOption === "VISAG"
                          ? "Enter phone number or email address"
                          : "Enter mobile money number"
                      }
                      {...register(`momoNumberOrEmailAddress`, {
                        required: `${
                          paymentOption === "VISAG"
                            ? "Enter phone number or email address"
                            : "Enter mobile money number"
                        }`,
                      })}
                    />
                    {errors[`momoNumberOrEmailAddress`] && (
                      <p className="text-xs text-red-500">
                        {errors[`momoNumberOrEmailAddress`]?.message}
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {!fetchingDeliveryCharge && (
            <div className="my-4">
              <p>
                Your total delivery fee is{" "}
                <span className="text-green-500 font-bold">
                  GHS {deliveryCharge?.total}
                </span>
                .
                {paymentOption === "VISAG"
                  ? ` You will receive an Email/SMS with a link to complete payment with your VISA or MASTERCARD.`
                  : paymentOption === "CASH"
                  ? ` Cash Payment of GHS${deliveryCharge?.total} will be taken from customer upon delivery.`
                  : paymentOption === "ACTDBT"
                  ? ` Delivery payment of GHS${deliveryCharge?.total} will be charged to your Digistore Account Wallet`
                  : ` You will receive a prompt on the mobile money number provided.
                    Enter your PIN to complete payments.`}
              </p>
            </div>
          )}

          <div className="mt-4 flex justify-center w-full ">
            <div className="mr-4">
              <Button
                disabled={fetching}
                btnText="Back"
                btnClasses={
                  fetching ? `bg-gray-300 text-gray-200` : `bg-black text-white`
                }
                onClick={() => setStep(0)}
              />
            </div>
            <div className="">
              <ButtonSpinner
                processing={fetching}
                onClick={handleSubmit(
                  paymentOption === "VISAG"
                    ? onProcessCardPayment
                    : onProcessPayment
                )}
                btnText="Process Payment"
                btnClasses="capitalize font-medium"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectMomo;
