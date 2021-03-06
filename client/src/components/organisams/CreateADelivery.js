import React from "react";
import Input from "../atoms/Input";
import Spinner from "../atoms/Spinner";
import Label from "../molecules/Label";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import axios from "axios";
import { get, isEmpty } from "lodash";
import toast from "react-hot-toast";
import tailwind from "tailwind-rn";
import { Controller, useForm } from "react-hook-form";
import Modal from "../molecules/Modal";
import { useAuth } from "../../ctx/Auth";

const CreateADelivery = ({
  index,
  setValue,
  errors,
  number,
  items,
  notes,
  register,
  watch,
  fetching,
  setFetching,
  control,
}) => {
  const {
    state: { user },
  } = useAuth();

  // console.log(user);

  const {
    register: registerCustomer,
    formState: { errors: errorsRegisterCustomer },
    handleSubmit: handleRegisterCustomer,
    reset: resetRegisterCustomer,
  } = useForm();
  // const {state: {outlets}} =  useApp()
  // const [deliveryInputValue, setDeliveryInputValue] = React.useState("");
  const [customerData, setCustomerData] = React.useState(null);
  const [openCustomerDiv, setOpenCustomerDiv] = React.useState(false);
  const [showAddUserButton, setShowAddUserButton] = React.useState({
    status: false,
    text: `Add Customer`,
  });

  const [processing, setProcessing] = React.useState(false);
  const [modalIsOpen, setIsOpen] = React.useState(false);

  let outletSelected = watch("outletSelected");
  let deliveryInputValue = watch("deliveryInputValue", "");
  let deliveries = watch(`deliveries`);
  let deliveryData = watch(`deliveryFee`);
  let customerDetails = watch(`customerDetails`);
  let deliveryRouteCosts = watch(`deliveryRouteCosts`, []);
  let deliveryEstimate = watch(`deliveryEstimate`, null);

  // console.log(deliveryEstimate);

  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }

  // console.log({ value });

  React.useEffect(() => {
    const getCoordinates = async () => {
      setFetching(true);
      setValue(`deliveryFee`, null);
      setValue(`deliveryRouteCosts`, []);
      setValue(`deliveryEstimate`, null);
      // console.log(deliveryInputValue);

      const response = await axios.post("/api/coordinates", {
        deliveryInputValue,
      });
      const responsedata = await response.data;

      // console.log({ deliveryInputValue });
      // console.log({ responsedata });
      // return;

      // const stringCoordinates = `${responsedata["candidates"][0]["geometry"]["location"]["lat"]},${responsedata["candidates"][0]["geometry"]["location"]["lng"]}`; TODO: used with old url in get coordinates backend route
      const stringCoordinates = `${responsedata["results"][0]["geometry"]["location"]["lat"]},${responsedata["results"][0]["geometry"]["location"]["lng"]}`; // TODO: used with old url in get coordinates backend route
      setValue("coordinates", stringCoordinates);
      // console.log({ stringCoordinates });

      const fetchItems = async (stringCoordinates) => {
        try {
          // eslint-disable-next-line react-hooks/exhaustive-deps
          outletSelected = JSON.parse(
            outletSelected ? outletSelected : JSON.stringify({})
          );

          const payload = {
            pickup_id: outletSelected?.outlet_id,
            pickup_gps: outletSelected?.outlet_gps,
            pickup_location: outletSelected?.outlet_address,
            destination_location: deliveryInputValue?.value?.description,
            destination_gps: stringCoordinates,
          };

          // console.log({ payload });

          if (!isEmpty(outletSelected)) {
            const { data: resData } = await axios.post(
              "/api/delivery-charge",
              payload
            );
            // console.log({ resData });

            if (Number(resData?.status) === 0) {
              let { data } = await resData;

              // const price = get(data, "price", 0);
              // data = { ...data, price: Number(parseFloat(price)) };

              // console.log(data);

              setValue(`deliveryRouteCosts`, data);

              // setValue(`deliveryFee`, data);
              // setValue(`deliveryRouteCosts`, data);
            } else {
              toast.error(
                `We do not deliver to this area. Please select a different area`
              );
              setValue("deliveryInputValue", "");
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
          setFetching(false);
        }
      };

      if (stringCoordinates) {
        await fetchItems(stringCoordinates);
      }

      setFetching(false);
    };

    if (deliveryInputValue?.label) {
      getCoordinates();
    }

    return () => {};
  }, [outletSelected, deliveryInputValue]);

  React.useEffect(() => {
    if (!deliveries[index]?.number || deliveries[index]?.number.length < 10) {
      // setOpenCustomerDiv(false);
      setValue(`customerDetails`, null);
    }

    if (
      deliveries[index]?.number &&
      deliveries[index]?.number?.length >= 10 //TODO: this is for Ghana number implentation
    ) {
      (async () => {
        setFetching(true);
        // setOpenCustomerDiv(false);
        setShowAddUserButton({
          status: false,
          text: `Add Customer`,
        });
        setValue(`customerDetails`, null);
        const { data } = await axios.post("/api/customer-details", {
          phone: encodeURIComponent(deliveries[index]?.number),
        });

        // console.log(data?.data[0]);
        if (Number(data?.status) === 0) {
          if (data?.data && data?.data?.length > 0) {
            setCustomerData(data?.data);
            if (data?.data[0]) {
              setValue(`customerDetails`, data?.data[0]);
            }
            // setValue("customerDetails", customer);
            // setOpenCustomerDiv(true);
          } else {
            // setOpenCustomerDiv(false);
            setValue(`customerDetails`, null);
          }
        } else if (Number(data?.status) === 91) {
          toast.error(data?.message);
          setShowAddUserButton({
            status: true,
            text: `Add Customer`,
          });
        } else {
          toast.error(data?.message);
          // setOpenCustomerDiv(false);
          // setCustomerData(null);
          setValue(`customerDetails`, null);
        }
        setFetching(false);
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deliveries[index]?.number, index]);

  // const deliveryInput = register("deliveryInputValue", {
  //   required: `Delivery location is required`,
  // });

  const days = Array.from({ length: 31 }, (e, i) => {
    return i + 1;
  });

  const months = Array.from({ length: 12 }, (e, i) => {
    return i + 1;
  });

  const sumbitToServer = async (values) => {
    try {
      // console.log(values);
      setProcessing(true);

      const userData = {
        client_name: values?.fullName,
        client_phone: values?.phone,
        client_merchant: user?.user_merchant_id,
        mod_by: user?.login,
      };

      if (values?.email) userData["client_email"] = values?.email;
      if (values?.birthDay && values?.birthMonth)
        userData["client_dob"] = `${values?.birthDay}-${values?.birthMonth}`;

      // console.log(userData);

      const response = await axios.post("/api/add-customer", userData);
      const { status } = await response.data;

      // console.log(status, message);

      if (Number(status) === 0 || Number(status) === 91) {
        const { data } = await axios.post("/api/customer-details", {
          phone: encodeURIComponent(userData?.client_phone),
        });

        // console.log(data);
        if (Number(data?.status) === 0) {
          if (data?.data && data?.data?.length > 0) {
            setCustomerData(data?.data);
            setValue(`customerDetails`, data?.data[0]);
            setShowAddUserButton({
              status: false,
              text: `Add Customer`,
            });
            setOpenCustomerDiv(false);
          }
        }
      }

      resetRegisterCustomer({
        fullName: "",
        phone: "",
        email: "",
        birthDay: "",
        birthMonth: "",
      });
      closeModal();
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
      setProcessing(false);
    }
  };

  return (
    <div className="">
      {/* <h1 className="text-sm font-bold text-center text-blue-500">
        Delivery Location {index + 1}
      </h1> */}

      <Modal
        modalIsOpen={modalIsOpen}
        closeModal={() => {
          closeModal();
          resetRegisterCustomer({
            fullName: "",
            phone: "",
            email: "",
            birthDay: "",
            birthMonth: "",
          });
        }}
      >
        <div className="flex-auto px-4 py-10 pt-0 lg:px-10">
          <div className="relative w-full mb-3">
            <input
              {...registerCustomer("fullName", {
                required: "Full name is required",
              })}
              type="text"
              className="w-full p-2 text-sm bg-white border border-gray-500 rounded placeholder-blueGray-500 text-blueGray-600 focus:outline-none focus:ring-0"
              placeholder="Full Name"
            />
            <p className="text-sm text-red-500">
              {errorsRegisterCustomer?.fullName?.message}
            </p>
          </div>

          <div className="relative w-full mb-3">
            <input
              {...registerCustomer("phone", {
                required: "Phone number is required",
                minLength: {
                  value: 10,
                  message: `Phone number must be 10 characters`,
                },
              })}
              type="number"
              className="w-full p-2 text-sm bg-white border border-gray-500 rounded placeholder-blueGray-500 text-blueGray-600 focus:outline-none focus:ring-0"
              placeholder="Phone Number"
            />
            <p className="text-sm text-red-500">
              {errorsRegisterCustomer?.phone?.message}
            </p>
          </div>

          <div className="relative w-full mb-3">
            <input
              {...registerCustomer("email")}
              type="email"
              className="w-full p-2 text-sm bg-white border border-gray-500 rounded placeholder-blueGray-500 text-blueGray-600 focus:outline-none focus:ring-0"
              placeholder="Email Address"
            />
            <p className="text-sm text-red-500">
              {errorsRegisterCustomer?.email?.message}
            </p>
          </div>

          <div className="flex items-center justify-between w-full mb-3">
            <div className="w-1/2 mr-2">
              <select
                {...registerCustomer("birthDay")}
                defaultValue=""
                className="w-full py-2 text-sm bg-white border border-gray-500 rounded placeholder-blueGray-500 text-blueGray-600 focus:outline-none focus:ring-0"
              >
                <option value="" disabled="disabled">
                  Day
                </option>
                {days.map((day) => {
                  return (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  );
                })}
              </select>
              <p className="text-sm text-red-500">
                {errorsRegisterCustomer?.birthDay?.message}
              </p>
            </div>

            <div className="w-1/2 ">
              <select
                {...registerCustomer("birthMonth")}
                defaultValue=""
                className="w-full py-2 text-sm bg-white border border-gray-500 rounded placeholder-blueGray-500 text-blueGray-600 focus:outline-none focus:ring-0"
              >
                <option value="" disabled="disabled">
                  Month
                </option>
                {months.map((month) => {
                  const monthNames = {
                    1: "January",
                    2: "February",
                    3: "March",
                    4: "April",
                    5: "May",
                    6: "June",
                    7: "July",
                    8: "August",
                    9: "September",
                    10: "October",
                    11: "November",
                    12: "December",
                  };
                  return (
                    <option key={month} value={month}>
                      {monthNames[month]}
                    </option>
                  );
                })}
              </select>
              <p className="text-sm text-red-500">
                {errorsRegisterCustomer?.birthMonth?.message}
              </p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              disabled={processing}
              className={`${
                processing
                  ? "bg-gray-300 text-gray-200"
                  : "bg-green-600 text-white"
              } active:bg-green-600 text-sm font-bold  px-6 py-2 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full ease-linear transition-all duration-150`}
              onClick={(e) => {
                e.preventDefault();
                handleRegisterCustomer(sumbitToServer)();
              }}
            >
              {processing && (
                <div className="inline-block mr-2">
                  <Spinner
                    type={"TailSpin"}
                    color="black"
                    width="10"
                    height="10"
                  />
                </div>
              )}
              <div className="flex items-center justify-center w-full">
                Add Customer
              </div>
            </button>
          </div>
        </div>
      </Modal>
      <div className="flex items-center w-full">
        <div className="w-full">
          <Label text="Delivery Location" />
          <div className="flex items-center w-full">
            <div className={`${"w-full"} transition-all duration-150`}>
              <Controller
                control={control}
                name="deliveryInputValue"
                rules={{
                  required: {
                    value: true,
                    message: `Delivery location is required`,
                  },
                }}
                render={({ field: { onChange, onBlur, value, ref } }) => (
                  <GooglePlacesAutocomplete
                    selectProps={{
                      // className: "focus:ring-1",
                      styles: {
                        control: (base) => ({
                          ...base,
                          ...tailwind("border border-gray-500 py-1"),
                        }),
                        placeholder: (base) => ({
                          ...base,
                          ...tailwind("text-gray-900"),
                        }),
                      },
                      placeholder: "Search for the delivery location",
                      value: deliveryInputValue,
                      onChange,
                    }}
                  />
                )}
              />
              {errors[`deliveryInputValue`] && (
                <p className="text-xs text-red-500">
                  {errors?.deliveryInputValue?.message}
                </p>
              )}
            </div>
            {fetching && (
              <div className="ml-2">
                <Spinner color="rgba(16, 185, 129)" height={20} width={20} />
              </div>
            )}
          </div>
          {errors[`deliveries`] && errors[`deliveries`][index] && (
            <p className="text-xs text-red-500">
              {errors[`deliveries`][index]?.deliveryFee?.message}
            </p>
          )}

          {watch(`deliveryInputValue`) && (
            <div className="mt-4">
              <Label
                text={`Select Delivery Option
              ${
                deliveryRouteCosts?.distance
                  ? `(${deliveryRouteCosts?.distance} from outlet)`
                  : ``
              }`}
              />
              <select
                {...register("deliveryEstimate", {
                  required: `Please select a delivery rate`,
                })}
                defaultValue=""
                className="block w-full px-3 py-3 text-gray-900 bg-white border border-gray-500 rounded focus:outline-none focus:border-black"
              >
                <option value="" disabled="disabled">{`Select Option`}</option>
                {(deliveryRouteCosts?.pricingestimate || [])?.map(
                  (estimate, index) => {
                    return (
                      <option
                        key={estimate.estimateName + index}
                        value={JSON.stringify(estimate)}
                      >
                        {estimate.estimateName} @ {estimate.currency}
                        {estimate.price}
                      </option>
                    );
                  }
                )}
              </select>
              {errors?.deliveryEstimate && (
                <p className="text-xs text-red-500">
                  {errors?.deliveryEstimate?.message}
                </p>
              )}
            </div>
          )}

          {deliveryEstimate && (
            <div className="w-full mt-4">
              <p>
                <span className="font-bold">Delivery Fee: </span>
                <span>{`GHS${JSON.parse(deliveryEstimate)?.price}`}</span>
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="w-full mt-4">
        <Label text="Recipient Number" />
        <div className="relative w-full">
          <Input
            inputClasses="!border !border-gray-500 !shadow-none hover:focus:!ring-0"
            placeholder="Enter recipient's number"
            {...register(`deliveries[${index}].number`, {
              required: `Recipient number is required`,
              minLength: {
                value: 10,
                message: `Number must be 10 characters`,
              },
            })}
            type="number"
            defaultValue={number}
          />

          {openCustomerDiv && (
            <div className="mt-1 h-[100px] w-full border border-gray-500 rounded p-2 bg-gray-100 z-50 overflow-scroll cursor-pointer">
              {customerData?.map((customer) => {
                return (
                  <div key={customer?.customer_id}>
                    <p
                      className="my-2 text-xs"
                      onClick={() => {
                        setValue("customerDetails", customer);
                        setOpenCustomerDiv(false);
                        // setValue(
                        //   `deliveries[${index}].number`,
                        //   customer?.customer_phone
                        // );
                      }}
                    >
                      <span className="mr-2">{customer?.customer_name}</span>
                      <span>{customer?.customer_phone}</span>
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {showAddUserButton?.status && (
            <button onClick={openModal} className="mt-2 text-sm text-blue-500">
              {showAddUserButton?.text}
            </button>
          )}

          {customerDetails && (
            <div className="w-full mt-4">
              <p>
                <span className="font-bold">Recipient Name: </span>
                <span>{`${customerDetails?.customer_name}`}</span>
              </p>
            </div>
          )}
        </div>
        {errors[`deliveries`] && errors[`deliveries`][index] && (
          <p className="text-xs text-red-500">
            {errors[`deliveries`][index]?.number?.message}
          </p>
        )}
      </div>

      <div className="w-full mt-4">
        <Label text="Items to be delivered [use comma (,) to separate various items]" />
        <Input
          inputClasses="!border !border-gray-500 !shadow-none hover:focus:!ring-0"
          placeholder="Enter item(s) to be delivered "
          {...register(`deliveries[${index}].items`, {
            required: `Items to be delivered required`,
          })}
          defaultValue={items}
        />
        {errors[`deliveries`] && errors[`deliveries`][index] && (
          <p className="text-xs text-red-500">
            {errors[`deliveries`][index]?.items?.message}
          </p>
        )}
      </div>

      <div className="w-full mt-4">
        <Label text="Delivery note" />
        <Input
          inputClasses="!border !border-gray-500 !shadow-none hover:focus:!ring-0"
          placeholder="Enter delivery note"
          {...register(`deliveries[${index}].notes`)}
          defaultValue={notes}
        />
      </div>
    </div>
  );
};

export default CreateADelivery;
