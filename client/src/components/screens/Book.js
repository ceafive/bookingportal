import axios from "axios";
import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useApp } from "../../ctx/App";
import ErrorMessage from "../atoms/ErrorMessage";
import Select from "../atoms/Select";
import InputWithLabel from "../molecules/InputWithLabel";
import Label from "../molecules/Label";

import DayPickerInput from "react-day-picker/DayPickerInput";
import { DateUtils } from "react-day-picker";

import {
  capitalize,
  isEmpty,
  isEqual,
  pick,
  flattenDeep,
  uniqueId,
  upperCase,
} from "lodash";
import toast from "react-hot-toast";

import dateFnsFormat from "date-fns/format";
import dateFnsParse from "date-fns/parse";
import { getDates } from "../../utils";

function parseDate(str, format, locale) {
  const parsed = dateFnsParse(str, format, new Date(), { locale });
  if (DateUtils.isDate(parsed)) {
    return parsed;
  }
  return undefined;
}

function formatDate(date, format, locale) {
  return dateFnsFormat(date, format, { locale });
}

const daysOfWeek = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

function DatePicker({ control, name }) {
  const {
    state: {
      clientBookingDetails: { testSelection },
    },
  } = useApp();

  const FORMAT = "PPPP";

  const bookingDays = JSON.parse(testSelection?.product_booking_days);

  const bookingDates =
    testSelection?.product_booking_dates ||
    testSelection?.product_booking_dates?.length
      ? JSON.parse(testSelection?.product_booking_dates)
      : [];

  // modifiers
  const closedDays = bookingDays
    // ?.filter((v) => false)
    ?.filter((v) => v?.isClosed)
    ?.map((v, i) => {
      return daysOfWeek[v?.day];
    });

  const allDatesArray = flattenDeep(
    bookingDates?.map((v) => getDates(new Date(v?.from), new Date(v?.to)))
  );
  // console.log(bookingDates);
  // console.log(allDatesArray);

  const disabledDays = allDatesArray;

  function isDayDisabled(day) {
    return !disabledDays.some((disabledDay) =>
      DateUtils.isSameDay(day, disabledDay)
    );
  }
  //

  return (
    <div>
      <Controller
        control={control}
        name={name}
        rules={{
          validate: (value) => Boolean(value) || "Booking date must be entered",
        }}
        render={({
          field: { onChange, onBlur, value, ref },
          fieldState: { invalid, isTouched, isDirty, error },
        }) => {
          return (
            <>
              <DayPickerInput
                ref={ref}
                value={value}
                onDayChange={(day) => {
                  onChange(day);
                }}
                formatDate={formatDate}
                format={FORMAT}
                parseDate={parseDate}
                placeholder={`Select a date`}
                dayPickerProps={{
                  disabledDays: [
                    isDayDisabled,
                    {
                      before: new Date(),
                      daysOfWeek: closedDays,
                    },
                  ],
                }}
                // placeholder={`${dateFnsFormat(new Date(), FORMAT)}`}
              />

              {/* <p className="text-xs text-red-500">{error?.message}</p> */}
            </>
          );
        }}
      />
    </div>
  );
}

const Book = () => {
  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm();

  const bookingDate = watch("bookingDate");
  const watchBookingPhoneNumber = watch("phone", "");

  const {
    state: {
      provider: { providerDetails, providerOutletDetails },
      clientBookingDetails: { testSelection },
    },
    actions: { setComponentToRender, setClientBookingDetails },
  } = useApp();

  const [timeSlots, setTimeSlots] = React.useState([
    {
      name: `Select a date to proceed`,
      value: "",
    },
  ]);

  const [loading, setLoading] = React.useState(false);

  // console.log({ bookingDate });
  // console.log({ testSelection });

  React.useEffect(() => {
    if (bookingDate) {
      setTimeSlots([
        {
          name: `Select a date to proceed`,
          value: "",
        },
      ]);

      (async () => {
        const pastOrdersRes = await axios.post("/api/past-orders", {
          merchant: providerDetails?.store_merchant,
          date: bookingDate,
        });
        const pastOrdersResData = pastOrdersRes?.data ?? {};
        // console.log(pastOrdersResData);

        if (Number(pastOrdersResData?.status) === 0) {
          const pastOrdersSize = pastOrdersResData?.data?.length;
          // console.log(pastOrdersSize);

          if (!pastOrdersSize) {
            setTimeSlots(
              [
                {
                  name: `Select a time option`,
                  value: "",
                },
              ].concat(
                (testSelection?.product_properties || []).map((property) => {
                  return {
                    name: property?.variantOptionValue?.Time,
                    value: property?.variantOptionValue?.Time,
                  };
                })
              )
            );
          } else {
            setTimeSlots(
              [
                {
                  name: `Select a time option`,
                  value: "",
                },
              ].concat(
                (testSelection?.product_properties_variants || [])
                  // (testSelection?.product_properties || [])
                  .map((property) => {
                    const quantity =
                      Number(property?.variantOptionBookingSlot) === -99
                        ? 10000000000000
                        : Number(property?.variantOptionBookingSlot);
                    const pastOrders = pastOrdersResData?.data;

                    const sizeOfPastOrders = pastOrders.filter(
                      (order) =>
                        order?.order_slot === property?.variantOptionValue?.Time
                    )?.length;

                    const isFull = sizeOfPastOrders >= quantity;

                    if (isFull) return null; // if is full, return null
                    return {
                      name: property?.variantOptionValue?.Time,
                      value: property?.variantOptionValue?.Time,
                    };
                  })
                  .filter(Boolean) // if is full remove item from array
              )
            );
          }
        }
      })();
    }

    return () => {};
  }, [
    bookingDate,
    providerDetails?.store_booking_slot_qty,
    providerDetails?.store_merchant,
    testSelection?.product_properties,
  ]);

  // console.log(testSelection);

  const cartItemsTotalPrice = (items, coupon = null) => {
    let total = items.reduce((price, product) => {
      return price + product?.totalPrice;
    }, 0);
    const discount = coupon ? total * coupon : 0;

    return Number(parseFloat(total - discount));
  };

  const getCartItemsPrice = (items) =>
    Number(parseFloat(cartItemsTotalPrice(items).toFixed(2)));

  const onRaiseOrder = async (values) => {
    try {
      setLoading(true);
      const bookingTime = values?.bookingTime;

      const foundProperty = testSelection?.product_properties?.find(
        (item) => item?.property_value === bookingTime
      );

      const foundVariant = testSelection?.product_properties_variants?.find(
        (item) => {
          const values = Object.keys(item?.variantOptionValue);
          const foundKey = values.find(
            (item) => upperCase(item) === upperCase(foundProperty?.property_id)
          );

          return (
            item?.variantOptionValue[foundKey] === foundProperty?.property_value
          );
        }
      );

      // console.log(foundVariant);

      if (!foundVariant) return;

      const allItems = [
        {
          ...testSelection,
          price: Number(testSelection?.product_price),
          uniqueid: uniqueId(testSelection?.product_id),
          quantity: 1,
          totalPrice: Number(
            parseFloat(Number(testSelection?.product_price) * 1).toFixed(2)
          ),
          variantSelected: { [foundProperty?.property_id]: foundProperty },
          variantSelelectedID: foundVariant?.variantOptionId,
          variantSelelectedPrice: Number(foundVariant?.variantOptionPrice),
        },
      ];
      // console.log({ allItems });
      const items = allItems.reduce((acc, curr, index) => {
        // console.log(curr?.variantSelected);
        const variants = Object.values(curr?.variantSelected).map((variant) => {
          return `${capitalize(variant?.property_value)}`;
        });
        // console.log({ variants });

        const properties = Object.entries(curr?.variantSelected).reduce(
          (acc, variant, index) => {
            return {
              ...acc,
              [variant[0]]: [variant[1]][0]?.property_value || "Normal",
            };
          },
          {}
        );

        const addVariants =
          variants.length > 0 ? ` (${variants.join(", ")})` : "";
        // console.log(properties);
        // console.log(addVariants);

        return {
          ...acc,
          [index]: {
            order_item_no: curr?.product_id,
            order_item_qty: curr?.quantity,
            order_item: `${curr?.product_name}${
              isEqual(properties, { Type: "Normal" }) ? "" : addVariants
            }`,
            order_item_amt: curr?.totalPrice,
            order_item_prop: isEqual(properties, { Type: "Normal" })
              ? {}
              : properties,
            order_item_prop_id: curr?.variantSelelectedID,
          },
        };
      }, {});

      // console.log(values);
      let concatValues = "";

      // passing it manually for Vodafone
      for (let i in {
        ...pick(values, [
          "uniName",
          "studentIDNumber",
          "studentRegion",
          "bookingDate",
          "bookingTime",
          "studentHall", // must always be last since it's optional
        ]),
      }) {
        concatValues += `${i}=${values[i]}&`;
      }

      const data = {
        order_notes: concatValues,
        // order_items: items,
        order_items: JSON.stringify(items),
        delivery_outlet: providerOutletDetails[0]?.outlet_id,
        delivery_type: "WALK-IN",
        delivery_notes: "",
        delivery_id: providerOutletDetails[0]?.outlet_id,
        delivery_location: "",
        delivery_gps: "",
        delivery_charge_type: "",
        delivery_charge_ref: "",
        name: values?.studentName || "",
        number: values?.phone || "",
        delivery_contact: "",
        delivery_email: values?.email || "",
        order_amount: getCartItemsPrice(allItems),
        order_discount: 0,
        order_discount_code: "",
        order_discount_type: "",
        delivery_charge: 0,
        service_charge: 0,
        total_amount: getCartItemsPrice(allItems),
        merchant: providerDetails?.store_merchant,
        source: "BOOKING",
        mod_by: "CUSTOMER",
        customer: "",
        order_date: values.bookingDate,
        order_type: "BOOKING",
      };

      console.log(`payload`, data);
      setClientBookingDetails({
        bookingPayload: {
          ...data,
          order_items: items,
        },
      });

      return;

      const { data: resData } = await axios.post("/api/raise-order", data);
      // console.log(resData);

      if (Number(resData?.status) !== 0) {
        toast.error(resData?.message);
      } else {
        setClientBookingDetails({
          bookingResponse: resData,
        });
        toast.success(resData["payment-message"]);
        setComponentToRender("payment");
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
      setLoading(false);
    }
  };

  const validate = (dateString) => {
    const day = new Date(dateString).getDay();
    if (day === 0) {
      return false;
    }
    return true;
  };

  const handleBookingDate = (e) => {
    const value = e.target.value;
    // console.log(value);

    if (!validate(value)) {
      toast.error("Sorry. We do not work on Sundays");
      return setValue("bookingDate", "");
    }

    setValue("bookingDate", value);
  };

  // const bookingDateInput = register("bookingDate", {
  //   required: "Booking Date is required",
  // });

  React.useEffect(() => {
    // console.log(watchBookingPhoneNumber);
    if (watchBookingPhoneNumber?.length === 10) {
      (async () => {
        setLoading(true);
        const response = await axios.post("/api/customer-details", {
          phone: watchBookingPhoneNumber,
        });
        const responsedata = await response?.data;
        // console.log(responsedata);

        if (Number(responsedata?.status) === 0) {
          // console.log("here");
          setValue(`email`, responsedata?.data?.customer_email || "");
          setValue(`studentName`, responsedata?.data?.customer_name || "");
        } else {
          // console.log("there");
          setValue(`email`, "");
          setValue(`fullName`, "");
        }

        setLoading(false);
      })();
    }

    return () => {};
  }, [setValue, watchBookingPhoneNumber]);

  // console.log(loading);

  return (
    <div className="flex flex-col justify-center items-center w-full max-w-7xl">
      <div className="w-full">
        <div className="flex items-center w-full bg-brandBlue text-white text-xl h-10 pl-2">
          <h1>Booking and Payments System</h1>
        </div>

        <div className="px-3 lg:px-32 py-5">
          <h1 className="text-xl text-brandBlue font-bold">
            2. Client Information
          </h1>

          <hr className="my-2 border-gray-200 mb-5" />

          <div className="px-2">
            <div className="">
              <div className="w-full mb-3">
                <InputWithLabel
                  labelText={"Name of University"}
                  labelClasses="!capitalize !text-lg"
                  inputClasses="!border !border-gray-500"
                  {...register("uniName", {
                    required: "University name is required",
                  })}
                  type="text"
                  placeholder="University of Ghana"
                />
                <ErrorMessage text={errors?.uniName?.message} />
              </div>

              <div className="lg:flex justify-between w-full mb-3">
                <div className="lg:w-[48%] mb-3 lg:mb-0">
                  <InputWithLabel
                    labelText={"Name of Student"}
                    labelClasses="!capitalize !text-lg"
                    inputClasses="!border !border-gray-500"
                    {...register("studentName", {
                      required: "Student name is required",
                    })}
                    type="text"
                    placeholder="John Doe"
                  />
                  <ErrorMessage text={errors?.studentName?.message} />
                </div>

                <div className="lg:w-[48%] mb-3 lg:mb-0">
                  <InputWithLabel
                    labelText={"Student ID Number"}
                    labelClasses="!capitalize !text-lg"
                    inputClasses="!border !border-gray-500"
                    {...register("studentIDNumber", {
                      required: "Student ID number is required",
                    })}
                    type="text"
                    placeholder="XX1234567890"
                  />
                  <ErrorMessage text={errors?.studentIDNumber?.message} />
                </div>
              </div>

              {/* Section 2 */}
              <div className="lg:flex justify-between w-full mb-3">
                <div className="lg:w-[48%] mb-3 lg:mb-0">
                  <InputWithLabel
                    labelText={"Mobile Phone"}
                    labelClasses="!capitalize !text-lg"
                    inputClasses="!border !border-gray-500"
                    {...register("phone", {
                      required: "Phone number is required",
                      minLength: {
                        value: 10,
                        message: "Phone number must be 10 chars",
                      },
                      maxLength: {
                        value: 10,
                        message: "Phone number must be 10 chars",
                      },
                    })}
                    type="number"
                    placeholder="02444545455"
                    min="1"
                  />
                  <ErrorMessage text={errors?.phone?.message} />
                </div>
                <div className="lg:w-[48%] mb-3 lg:mb-0">
                  <InputWithLabel
                    labelText={"Email"}
                    labelClasses="!capitalize !text-lg"
                    inputClasses="!border !border-gray-500"
                    {...register("email", {
                      required: "Email is required",
                    })}
                    type="email"
                    placeholder="johndoe@mail.com"
                  />
                  <ErrorMessage text={errors?.email?.message} />
                </div>
              </div>

              {/* Section 4 */}
              <div className="lg:flex justify-between w-full mb-3">
                <div className="lg:w-[48%] mb-3 lg:mb-0">
                  <InputWithLabel
                    labelText={"Region of Residence"}
                    labelClasses="!capitalize !text-lg"
                    inputClasses="!border !border-gray-500"
                    {...register("studentRegion", {
                      required: "Region of residence is required",
                    })}
                    type="text"
                    placeholder="Bono"
                  />
                  <ErrorMessage text={errors?.studentRegion?.message} />
                </div>

                <div className="lg:w-[48%] mb-3 lg:mb-0">
                  <InputWithLabel
                    labelText={"Hall of Residence (if applicable)"}
                    labelClasses="!capitalize !text-lg"
                    inputClasses="!border !border-gray-500"
                    {...register("studentHall", {})}
                    type="text"
                    placeholder="Casely-Hayford"
                  />
                </div>
              </div>

              <div className="lg:flex justify-between w-full mb-3">
                <div className="lg:w-[48%] mb-3 lg:mb-0">
                  <label
                    className={`block text-black font-bold mb-1 !capitalize !text-lg`}
                  >
                    {"Date of Booking"}
                  </label>
                  <DatePicker control={control} name={"bookingDate"} />
                  {/* <InputWithLabel
                    labelText={"Date of Booking"}
                    labelClasses="!capitalize !text-lg"
                    inputClasses="!border !border-gray-500"
                    ref={bookingDateInput?.ref}
                    name={bookingDateInput?.name}
                    onBlur={bookingDateInput?.onBlur}
                    value={bookingDateInput?.value}
                    onChange={(e) => {
                      handleBookingDate(e);
                    }}
                    type="date"
                    placeholder="John Doe"
                    min={format(new Date(), "yyyy-MM-dd")}
                  /> */}
                  <ErrorMessage text={errors?.bookingDate?.message} />
                </div>

                <div className="lg:w-[48%] mb-3 lg:mb-0">
                  <Label
                    text="Select your preferred booking time"
                    labelClasses="!capitalize !text-lg"
                  />
                  <Select
                    selectClasses="px-2"
                    {...register("bookingTime", {
                      required: `Select booking time`,
                    })}
                    data={timeSlots}
                  />
                  <ErrorMessage text={errors?.bookingTime?.message} />
                </div>
              </div>

              {/* Section 5 */}
              <div className="flex w-full justify-between">
                <button
                  disabled={loading}
                  className="flex items-center"
                  onClick={() => {
                    setComponentToRender("schedule");
                  }}
                >
                  <span className="text-2xl font-bold">&#8592; </span>
                  <span> Back</span>
                </button>
                <button
                  disabled={loading}
                  className={`px-6 py-2 ${
                    !loading ? "bg-brandGreen2" : "bg-gray-300"
                  }  text-white shadow rounded`}
                  onClick={handleSubmit(async (values) => {
                    setClientBookingDetails({
                      bookingDetails: values,
                    });

                    await onRaiseOrder(values);
                  })}
                >
                  <span>Continue</span>
                  <span> &#10140;</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Book;
