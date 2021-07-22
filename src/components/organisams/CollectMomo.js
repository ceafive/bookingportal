import axios from "axios";
import React from "react";
import { useApp } from "../../ctx/App";
import { useAuth } from "../../ctx/Auth";
import Button from "../atoms/Button";
import Input from "../atoms/Input";
import Select from "../atoms/Select";
import Label from "../molecules/Label";

const CollectMomo = ({
  register,
  errors,
  watch,
  handleSubmit,
  onBookDelivery,
  setStep,
  setValue,
  getValues,
}) => {
  const {
    state: { user },
  } = useAuth();

  const {
    state: { activePayments },
  } = useApp();

  const [fetching, setFetching] = React.useState(true);
  const [deliveryCharge, setDeliveryCharge] = React.useState(0);
  const paymentOption = watch("paymentOption");

  React.useEffect(() => {
    if (paymentOption) {
      const {
        deliveryFee: { price },
      } = getValues();

      // console.log({ price });
      const { user_merchant_id } = user;

      const data = {
        channel: paymentOption,
        amount: price,
        merchant: user_merchant_id,
      };

      (async () => {
        const res = await axios.post("/api/transaction-fees", data);
        const resData = res?.data ?? {};

        // console.log(resData);
        setDeliveryCharge(resData);
        setValue("totalAmount", resData);
        setFetching(false);
      })();
    }
  }, [getValues, paymentOption, setValue, user]);

  // console.log({ paymentOption });

  return (
    <div className="w-ful">
      <div className="flex flex-col items-center">
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
          </div>

          {!fetching && (
            <div className="my-4">
              <p>
                Your total delivery fees is{" "}
                <span className="text-green-500 font-bold">
                  GHS {deliveryCharge?.total}
                </span>
                . You will receive a prompt on the mobile money number provided.
                Enter your PIN to complete payments.
              </p>
            </div>
          )}

          <div className="mt-4 flex justify-center w-full ">
            <div className="mr-4">
              <Button
                btnText="Back"
                btnClasses="bg-black text-white"
                onClick={() => setStep(0)}
              />
            </div>
            <div className="">
              <Button
                btnText="Book Delivery"
                btnClasses="bg-green-500 text-white "
                onClick={handleSubmit(onBookDelivery)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectMomo;
