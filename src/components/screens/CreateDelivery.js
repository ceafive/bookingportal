import React from "react";
import Logo from "../atoms/Logo";
import Button from "../atoms/Button";
import Header from "../molecules/Header";
import Label from "../molecules/Label";
import Select from "../atoms/Select";
import { useAuth } from "../../ctx/Auth";
import CreateADelivery from "../organisams/CreateADelivery";
import { useApp } from "../../ctx/App";
import axios from "axios";
import { useFieldArray, useForm } from "react-hook-form";
import CollectMomo from "../organisams/CollectMomo";
import toast from "react-hot-toast";
import StatusCheck from "../organisams/StatusCheck";
import { throttle, upperCase } from "lodash";
import Spinner from "../atoms/Spinner";

const CreateDelivery = () => {
  const {
    state: { user },
    actions: { logoutUser },
  } = useAuth();

  const {
    state: { outlets, appLoading },
    actions: { setOutlets, setActivePayments, setAppLoading },
  } = useApp();

  const {
    control,
    register,
    watch,
    setValue,
    getValues,
    reset,
    formState: { errors },
    handleSubmit,
  } = useForm({
    defaultValues: {
      deliveries: [
        {
          number: "",
          items: "",
          notes: "",
        },
      ],
    },
  });

  const { fields, append } = useFieldArray({
    control,
    name: "deliveries",
  });

  const [step, setStep] = React.useState(0);
  const [fetching, setFetching] = React.useState(false);
  const [statusText, setStatusText] = React.useState(null);
  const [ticking, setTicking] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [confirmButtonText, setConfirmButtonText] = React.useState("");
  const [processError, setProcessError] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      setAppLoading(true);
      const resoutlets = await axios.post("/api/outlets", {
        merchant: user["user_merchant_id"],
      });
      const resactivepayments = await axios.post("/api/active-payments");
      const dataoutlets = resoutlets?.data?.data ?? [];
      const dataactivepayments = resactivepayments?.data?.data ?? [];

      const transformed = dataactivepayments
        .filter((dataactivepayment) => {
          if (
            dataactivepayment === "MTNMM" ||
            dataactivepayment === "VODAC" ||
            dataactivepayment === "VISAG" ||
            dataactivepayment === "TIGOC"
          )
            return true;
          else return false;
        })
        .map((dataactivepayment) => {
          const paymentOptions = {
            VISAG: "VISA AND MASTERCARD",
            MTNMM: "MTN MOBILE MONEY",
            TIGOC: "AIRTELTIGO MONEY",
            VODAC: "VODAFONE CASH",
          };

          return {
            name: dataactivepayment,
            label: paymentOptions[dataactivepayment],
          };
        });

      setOutlets(dataoutlets);
      setActivePayments(transformed);
      setAppLoading(false);
    })();
  }, [setActivePayments, setAppLoading, setOutlets, user]);

  // React.useEffect(() => {
  //   append({});

  //   if (fields.length > 1) {
  //     const fieldsLength = fields.length;

  //     remove(1);
  //   }
  // }, []);

  const onBookDelivery = async (values) => {
    try {
      setFetching(true);
      const outletSelected = JSON.parse(values?.outletSelected);
      const deliveries = values?.deliveries?.reduce((acc, val, index) => {
        const items = val?.items
          ?.split(",")
          .filter((item) => Boolean(item))
          .reduce((acc, item, index) => {
            return {
              ...acc,
              [index]: {
                delivery_item: item.trim(),
              },
            };
          }, {});

        return {
          ...acc,
          [index]: {
            delivery_location: values?.deliveryInputValue?.label,
            delivery_gps: values?.coordinates,
            delivery_name:
              "customerDetails" in values
                ? values?.customerDetails?.customer_name
                : "",
            delivery_contact: val?.number,
            delivery_email:
              "customerDetails" in values
                ? values?.customerDetails?.customer_email ?? ""
                : "",
            delivery_charge: values?.deliveryFee?.price,
            delivery_items: items,
            delivery_notes: val?.notes ?? "",
          },
        };
      }, {});

      const data = {
        merchant: user?.user_merchant_id,
        delivery_type: "DELIVERY",
        delivery_outlet: outletSelected?.outlet_id,
        deliveries: JSON.stringify(deliveries),
        total_amount: values?.totalAmount?.total,
        service_charge: values?.totalAmount?.charge,
        payment_type: values?.paymentOption === "VISAG" ? "CARD" : "MOMO",
        payment_number: values?.momoNumberOrEmailAddress,
        payment_network: values?.paymentOption,
        source: "INSHP",
        mod_by: user?.login,
      };

      // console.log(data);
      // return;
      const { data: resData } = await axios.post("/api/raise-order", data);
      // console.log({ resData });

      if (Number(resData?.status) !== 0) {
        toast.error(resData?.message);
      } else {
        setStatusText({ invoice: resData?.invoice, message: resData?.message });
        setStep(2);
        // toast.success(resData?.message);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setFetching(false);
    }
  };

  const onRaiseOrder = async (values) => {
    try {
      // console.log({ values });

      setFetching(true);
      const outletSelected = JSON.parse(values?.outletSelected);
      const deliveries = values?.deliveries?.reduce((acc, val, index) => {
        const items = val?.items
          ?.split(",")
          .filter((item) => Boolean(item))
          .reduce((acc, item, index) => {
            return {
              ...acc,
              [index]: {
                delivery_item: item.trim(),
              },
            };
          }, {});

        return {
          ...acc,
          [index]: {
            delivery_location: values?.deliveryInputValue?.label,
            delivery_gps: values?.coordinates,
            delivery_name:
              "customerDetails" in values
                ? values?.customerDetails?.customer_name
                : "",
            delivery_contact: val?.number,
            delivery_email:
              "customerDetails" in values
                ? values?.customerDetails?.customer_email ?? ""
                : "",
            delivery_charge: 0.1,
            // delivery_charge: values?.deliveryFee?.price,
            delivery_items: items,
            delivery_notes: val?.notes ?? "",
          },
        };
      }, {});

      const data = {
        delivery_type: "DELIVERY",
        delivery_outlet: outletSelected?.outlet_id,
        deliveries: JSON.stringify(deliveries),
        total_amount: 0.1,
        // total_amount: values?.deliveryFee?.price,
        source: "INSHP",
        merchant: user?.user_merchant_id,
        mod_by: user?.login,
      };

      // console.log(data);
      // return;
      const { data: resData } = await axios.post("/api/raise-order", data);

      if (Number(resData?.status) !== 0) {
        toast.error(resData?.message);
      } else {
        setStatusText({ invoice: resData?.invoice, message: resData?.message });
        setStep(1);
        // toast.success(resData?.message);
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

  // console.log(user);
  // console.log(errors);

  const sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  React.useEffect(() => {
    const verifyTransaction = async () => {
      try {
        setFetching(true);
        const getResData = async () => {
          const { data: resData } = await axios.post(
            "/api/verify-transaction",
            {
              merchantKey: "32ab0a3c-412b-11eb-9b73-f23c9170642f",
              trxID: statusText?.invoice,
            } //TODO: hardcoded key contact Philip
          );
          return resData;
        };

        await sleep(5000);
        const data = await getResData();
        const { message } = data; // new, awaiting_payment, paid, cancelled, failed, expired   ie message values
        // console.log(message);

        if (message === "new" || message === "awaiting_payment") {
          setLoading(true);
        } else {
          setConfirmButtonText("Start New Delivery");
          setProcessError(`${upperCase(message)} TRANSACTION`);
          setLoading(false);
          setFetching(false);
          // if (message === "paid") {
          // } else if (
          //   message === "cancelled" ||
          //   message === "failed" ||
          //   message === "new" ||
          //   message === "expired"
          // ) {
          // }
        }

        setLoading(false);
      } catch (error) {
        console.log(error);
      }
    };

    if (ticking) {
      throttle(verifyTransaction, 10000, {
        trailing: false,
      })();
      // !loading &&
      //   verifyTransactionResponse &&
      //   (verifyTransactionResponse?.message !== "new" || verifyTransactionResponse?.message !== "awaiting_payment") &&
      //   throttledFn.cancel();
    }
  }, [loading, statusText?.invoice, ticking, user.user_merchant_key]);

  const outletsData = outlets?.map((outlet) => {
    return {
      name: outlet?.outlet_name,
      value: JSON.stringify(outlet),
      props: {},
    };
  });

  if (appLoading) {
    return (
      <div className="flex flex-wrap justify-center items-center">
        <Spinner width={20} height={20} />
        <p className="w-full">Loading</p>
      </div>
    );
  }

  // console.log(window.gw.Pay);

  return (
    <div className="relative min-h-screen w-full">
      <Header>
        <div className="flex justify-between items-center h-full px-1">
          <div className="flex items-center">
            <div className="w-28">
              <Logo className="" />
            </div>
          </div>

          <div className="flex justify-between items-center text-sm">
            <div className="flex justify-between items-center mr-2">
              <div className="mr-1">
                <ion-icon name="person" />
              </div>
              <h1 className="-mt-1">{user?.user_merchant}</h1>
            </div>

            <div className="flex justify-between items-center">
              <div className="mr-1">
                <ion-icon name="log-out" />
              </div>
              <Button
                btnText={"Logout"}
                btnClasses="!shadow-none !rounded-none !p-0 !-mt-1"
                onClick={logoutUser}
              />
            </div>
          </div>
        </div>
      </Header>

      <div className="absolute top-[100px] w-full pb-4">
        {step === 0 && (
          <div>
            <p className="text-sm px-10 text-center mb-4 font-bold">
              Complete the form with the details to initiate the delivery
              request
            </p>
            <div className="flex flex-col items-center">
              <div className="w-10/12">
                <div className="w-full">
                  <Label text="Pickup Location/Outlet" />

                  <Select
                    selectClasses="!px-2"
                    {...register("outletSelected", {
                      required: `Select pickup location`,
                    })}
                    data={[
                      {
                        name: `Select the pickup location`,
                        value: "",
                        props: {
                          // disabled: true,
                        },
                      },
                    ].concat(outletsData)}
                  />

                  {errors[`outletSelected`] && (
                    <p className="text-xs text-red-500">
                      {errors[`outletSelected`]?.message}
                    </p>
                  )}
                </div>
                {fields.map(({ id, number, items, notes }, index) => {
                  return (
                    <div key={id} className="mt-4">
                      <CreateADelivery
                        register={register}
                        watch={watch}
                        index={index}
                        number={number}
                        items={items}
                        notes={notes}
                        setValue={setValue}
                        errors={errors}
                        fetching={fetching}
                        setFetching={setFetching}
                        control={control}
                      />

                      {/* {index === fields.length - 1 && (
                        <div className="flex flex-col justify-center w-full mt-4">
                          <div className="flex w-full">
                            {fields.length > 1 && (
                              <button
                                className="text-red-500 font-bold text-sm mr-2"
                                onClick={() => {
                                  remove(index);
                                }}
                              >
                                - Remove
                              </button>
                            )}
                            <button
                              className="text-green-500 font-bold text-sm"
                              onClick={() => {
                                append({});
                              }}
                            >
                              + Add New Delivery Location
                            </button>
                          </div>
                        </div>
                      )} */}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex justify-center mt-4">
              <div className="w-2/3">
                <Button
                  disabled={fetching}
                  btnText="Raise Order"
                  btnClasses={`${
                    fetching
                      ? "!bg-gray-300 !text-gray-100"
                      : "!bg-green-500 !text-white"
                  }`}
                  onClick={handleSubmit(onRaiseOrder)}
                />
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <CollectMomo
            register={register}
            handleSubmit={handleSubmit}
            errors={errors}
            setStep={setStep}
            watch={watch}
            getValues={getValues}
            setValue={setValue}
            fetching={fetching}
            statusText={statusText}
            setFetching={setFetching}
            setStatusText={setStatusText}
          />
        )}

        {step === 2 && (
          <StatusCheck
            statusText={statusText}
            fetching={fetching}
            setFetching={setFetching}
            setTicking={setTicking}
            setLoading={setLoading}
            loading={loading}
            ticking={ticking}
            setConfirmButtonText={setConfirmButtonText}
            confirmButtonText={confirmButtonText}
            setProcessError={setProcessError}
            processError={processError}
            setStep={setStep}
            reset={reset}
            append={append}
          />
        )}
      </div>
    </div>
  );
};

export default CreateDelivery;
