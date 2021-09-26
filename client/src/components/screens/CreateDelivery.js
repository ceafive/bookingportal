import React from "react";
import Button from "../atoms/Button";
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
import { intersectionWith, isEqual, upperCase } from "lodash";
import Spinner from "../atoms/Spinner";

const CreateDelivery = () => {
  const {
    state: { user },
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
  const [processError, setProcessError] = React.useState("");

  const statusCheckTotalRunTime = 20000;

  React.useEffect(() => {
    (async () => {
      setAppLoading(true);
      const resoutlets = await axios.post("/api/outlets", {
        merchant: user["user_merchant_id"],
      });
      const resactivepayments = await axios.post("/api/active-payments");
      const dataoutlets = resoutlets?.data?.data ?? [];
      const dataactivepayments = resactivepayments?.data?.data ?? [];

      const paymentOptions = {
        VISAG: "VISA AND MASTERCARD",
        MTNMM: "MTN MOBILE MONEY",
        TIGOC: "AIRTELTIGO MONEY",
        VODAC: "VODAFONE CASH",
        CASH: "CASH ON DELIVERY",
        ACTDBT: "INVOICING",
      };

      const transformed = dataactivepayments
        .filter((dataactivepayment) => {
          if (dataactivepayment === "INVPAY" || dataactivepayment === "VISAG")
            return false;
          else return true;
        })
        .filter((item) => {
          return (user?.user_permissions || []).includes(item);
        })
        .map((dataactivepayment) => {
          return {
            name: dataactivepayment,
            label: paymentOptions[dataactivepayment],
          };
        });

      // console.log({ transformed });

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

  // const onBookDelivery = async (values) => {
  //   try {
  //     setFetching(true);
  //     const outletSelected = JSON.parse(values?.outletSelected);
  //     const deliveries = values?.deliveries?.reduce((acc, val, index) => {
  //       const items = val?.items
  //         ?.split(",")
  //         .filter((item) => Boolean(item))
  //         .reduce((acc, item, index) => {
  //           return {
  //             ...acc,
  //             [index]: {
  //               delivery_item: item.trim(),
  //             },
  //           };
  //         }, {});

  //       return {
  //         ...acc,
  //         [index]: {
  //           delivery_location: values?.deliveryInputValue?.label,
  //           delivery_gps: values?.coordinates,
  //           delivery_name:
  //             "customerDetails" in values
  //               ? values?.customerDetails?.customer_name
  //               : "",
  //           delivery_contact: val?.number,
  //           delivery_email:
  //             "customerDetails" in values
  //               ? values?.customerDetails?.customer_email ?? ""
  //               : "",
  //           delivery_charge: values?.deliveryFee?.price,
  //           delivery_items: items,
  //           delivery_notes: val?.notes ?? "",
  //         },
  //       };
  //     }, {});

  //     const data = {
  //       merchant: user?.user_merchant_id,
  //       delivery_type: "DELIVERY",
  //       delivery_outlet: outletSelected?.outlet_id,
  //       deliveries: JSON.stringify(deliveries),
  //       total_amount: values?.totalAmount?.total,
  //       service_charge: values?.totalAmount?.charge,
  //       payment_type: values?.paymentOption === "VISAG" ? "CARD" : "MOMO",
  //       payment_number: values?.momoNumberOrEmailAddress,
  //       payment_network: values?.paymentOption,
  //       source: "INSHP",
  //       mod_by: user?.login,
  //     };

  //     // console.log(data);
  //     // return;
  //     const { data: resData } = await axios.post("/api/raise-order", data);
  //     // console.log({ resData });

  //     if (Number(resData?.status) !== 0) {
  //       toast.error(resData?.message);
  //     } else {
  //       setStatusText({ invoice: resData?.invoice, message: resData?.message });
  //       setStep(2);
  //       // toast.success(resData?.message);
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   } finally {
  //     setFetching(false);
  //   }
  // };

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
                ? values?.customerDetails?.customer_name || ""
                : "",
            delivery_contact: val?.number,
            delivery_email:
              "customerDetails" in values
                ? values?.customerDetails?.customer_email || ""
                : "",
            delivery_charge: Number(
              JSON.parse(values?.deliveryEstimate)?.price
            ),
            delivery_charge_type: JSON.parse(values?.deliveryEstimate)
              ?.pricingtype,
            delivery_charge_ref: JSON.parse(values?.deliveryEstimate)
              ?.estimateId,
            // delivery_charge: values?.deliveryFee?.price,
            delivery_items: items,
            delivery_notes: val?.notes ?? "",
          },
        };
      }, {});

      const data = {
        delivery_type: "DELIVERY",
        delivery_outlet: outletSelected?.outlet_id,
        // deliveries,
        deliveries: JSON.stringify(deliveries),
        total_amount: Number(JSON.parse(values?.deliveryEstimate)?.price),
        // total_amount: values?.deliveryFee?.price,
        source: "DIGIDELVRY",
        merchant: user?.user_merchant_id,
        mod_by: user?.login,
      };

      console.log(data);
      return;
      const { data: resData } = await axios.post("/api/raise-order", data);

      // console.log(resData);

      if (Number(resData?.status) !== 0) {
        toast.error(resData?.message);
      } else {
        setStatusText({
          invoice: resData?.invoice,
          message: resData?.message,
          order: resData?.order,
        });
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

  // const sleep = (ms) => {
  //   return new Promise((resolve) => setTimeout(resolve, ms));
  // };

  React.useEffect(() => {
    const verifyTransaction = async (firstTimeStarted, interval) => {
      try {
        setFetching(true);
        const getResData = async () => {
          const { data: resData } = await axios.post(
            "/api/verify-transaction",
            {
              merchantKey: "32ab0a3c-412b-11eb-9b73-f23c9170642f", //TODO: hardcoded key contact Philip
              trxID: statusText?.invoice,
            }
          );
          return resData;
        };

        // await sleep(30000);
        const data = await getResData();
        const { message } = data; // new, awaiting_payment, paid, cancelled, failed, expired   ie message values
        // console.log(message);

        if (message === "new" || message === "awaiting_payment") {
          if (Date.now() - firstTimeStarted > statusCheckTotalRunTime - 10000) {
            setConfirmButtonText("Start New Delivery");
            setProcessError(
              "Sorry, Payment for your Delivery request is pending confirmation. <br>You will be notified via Email/SMS once your payment is confirmed.<br>And your request will be processed."
            );
            setFetching(false);
            setLoading(false);
            setTicking(false);
            clearInterval(interval);
          }
        } else if (message === "paid") {
          setConfirmButtonText("Start New Delivery");
          setProcessError(`Delivery Request Payment Successful`);
          setFetching(false);
          setLoading(false);
          setTicking(false);
          clearInterval(interval);
        } else if (message === "failed") {
          setConfirmButtonText("Start New Delivery");
          setProcessError(`Delivery Request Payment Failed`);
          setFetching(false);
          setLoading(false);
          setTicking(false);
          clearInterval(interval);
        } else {
          setConfirmButtonText("Start New Delivery");
          setProcessError(`${upperCase(message)} TRANSACTION`);
          setFetching(false);
          setLoading(false);
          setTicking(false);
          clearInterval(interval);
        }
      } catch (error) {
        console.log(error);
      }
    };

    if (ticking) {
      setLoading(true);
      var started = Date.now();
      var interval = setInterval(() => {
        verifyTransaction(started, interval);
      }, 10000);
    }
  }, [statusText?.invoice, ticking]);

  const outletsData = outlets?.map((outlet) => {
    return {
      name: outlet?.outlet_name,
      value: JSON.stringify(outlet),
      props: {},
    };
  });

  if (appLoading) {
    return (
      <div className="flex flex-wrap items-center justify-center">
        <Spinner width={50} height={50} color="rgba(5, 150, 105)" />
      </div>
    );
  }

  // console.log(window.gw.Pay);

  return (
    <div className="relative w-full min-h-screen">
      <div className="absolute top-[100px] w-full pb-4">
        {step === 0 && (
          <div>
            <p className="px-10 mb-4 text-sm font-bold text-center">
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
                      required: `Pickup location is required`,
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
                                className="mr-2 text-sm font-bold text-red-500"
                                onClick={() => {
                                  remove(index);
                                }}
                              >
                                - Remove
                              </button>
                            )}
                            <button
                              className="text-sm font-bold text-green-500"
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
                  btnText="Book Delivery"
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
            setConfirmButtonText={setConfirmButtonText}
            setProcessError={setProcessError}
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
