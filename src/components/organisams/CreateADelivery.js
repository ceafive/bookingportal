import React from "react";
import Input from "../atoms/Input";
import Spinner from "../atoms/Spinner";
import Label from "../molecules/Label";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import axios from "axios";
import { get, isEmpty } from "lodash";
import toast from "react-hot-toast";
import tailwind from "tailwind-rn";

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
}) => {
  // const {state: {outlets}} =  useApp()
  // const [deliveryInputValue, setDeliveryInputValue] = React.useState("");
  const [deliveryData, setDeliveryData] = React.useState(null);
  const [customerData, setCustomerData] = React.useState(null);
  const [openCustomerDiv, setOpenCustomerDiv] = React.useState(false);

  let outletSelected = watch("outletSelected");
  let deliveryInputValue = watch("deliveryInputValue", "");
  let deliveries = watch(`deliveries`);

  // console.log({ value });

  React.useEffect(() => {
    const getCoordinates = async () => {
      setFetching(true);
      const response = await axios.post("/api/coordinates", {
        deliveryInputValue,
      });
      const responsedata = await response.data;
      // console.log({ responsedata });

      const stringCoordinates = `${responsedata["candidates"][0]["geometry"]["location"]["lat"]},${responsedata["candidates"][0]["geometry"]["location"]["lng"]}`;
      setValue("coordinates", stringCoordinates);

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

          if (!isEmpty(outletSelected)) {
            const { data: resData } = await axios.post(
              "/api/delivery-charge",
              payload
            );
            // console.log({ resData });
            // console.log({ payload });

            if (Number(resData?.status) === 0) {
              let { data } = await resData;

              const price = get(data, "price", 0);
              data = { ...data, price: Number(parseFloat(price)) };

              setDeliveryData(data);
              setValue(`deliveryFee`, data);
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
    if (deliveries[index]?.number && !customerData) {
      (async () => {
        const { data } = await axios.post("/api/customer-details", {
          phone: deliveries[index]?.number,
        });

        // console.log(data);
        if (Number(data?.status) === 0) {
          setCustomerData(data?.data);

          // if (customerData) {
          setOpenCustomerDiv(true);
          // }
        } else {
          setOpenCustomerDiv(false);
          setCustomerData(null);
        }
        // const dataoutlets = res?.data?.data ?? [];

        // setOutlets(dataoutlets);
        // setActivePayments(dataactivepayments);
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deliveries[index]?.number, index]);

  // const deliveryInput = register("deliveryInputValue", {
  //   required: `Delivery location is required`,
  // });

  return (
    <div className="">
      {/* <h1 className="text-center text-sm text-blue-500 font-bold">
        Delivery Location {index + 1}
      </h1> */}
      <div className="flex items-center w-full">
        <div className="w-full">
          <Label text="Delivery Location" />
          <div className="flex items-center w-full">
            <div className={`${"w-full"} transition-all duration-150`}>
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
                      ...tailwind("text-gray-500"),
                    }),
                  },
                  placeholder: "Search for the delivery location",
                  value: deliveryInputValue,
                  onChange: (value) => setValue("deliveryInputValue", value),
                }}
              />
            </div>
            {fetching && (
              <div className="ml-2">
                <Spinner color="rgba(16, 185, 129)" height={20} width={20} />
              </div>
            )}
          </div>
          {deliveryData && (
            <div className="w-full mt-4">
              <p>
                <span className="font-bold">Delivery Fee: </span>
                <span>{`GHS${deliveryData?.price}`}</span>
              </p>
            </div>
          )}
          {errors[`deliveries`] && errors[`deliveries`][index] && (
            <p className="text-xs text-red-500">
              {errors[`deliveries`][index]?.deliveryFee?.message}
            </p>
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
                message: `Must be 10 characters`,
              },
              maxLength: {
                value: 10,
                message: `Must be 10 characters`,
              },
            })}
            type="number"
            pattern="[0-9]*"
            noValidate
            defaultValue={number}
          />

          {openCustomerDiv && (
            <div className="flex absolute top-[60px] left-0 h-[100px] w-full border border-gray-500 rounded p-2 bg-gray-100 z-50 overflow-scroll">
              <p
                onClick={() => {
                  setValue("customerDetails", customerData);
                  setOpenCustomerDiv(false);
                }}
              >
                <span>{customerData?.customer_name}</span>{" "}
                <span className="text-sm">{customerData?.customer_phone}</span>
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
        <Label text="Items to be delivered" />
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
