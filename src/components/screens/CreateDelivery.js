import React from "react";
import Logo from "../atoms/Logo";
import Button from "../atoms/Button";
import Header from "../molecules/Header";
import { useAuth } from "../../ctx/Auth";
import CreateADelivery from "../organisams/CreateADelivery";
import { useApp } from "../../ctx/App";
import axios from "axios";
import { useForm } from "react-hook-form";
import { get, isEmpty } from "lodash";

const CreateDelivery = () => {
  const {
    state: { user },
    actions: { logoutUser },
  } = useAuth();

  const {
    actions: { setOutlets },
  } = useApp();

  const { register, watch } = useForm();
  const [fetching, setFetching] = React.useState(false);
  const [value, setValue] = React.useState("");

  let outletSelected = watch("outletSelected");

  React.useEffect(() => {
    const getCoordinates = async () => {
      setFetching(true);
      const response = await axios.post("/api/coordinates", { value });
      const responsedata = await response.data;
      const stringCoordinates = `${responsedata["candidates"][0]["geometry"]["location"]["lat"]},${responsedata["candidates"][0]["geometry"]["location"]["lng"]}`;

      const fetchItems = async (stringCoordinates) => {
        try {
          outletSelected = JSON.parse(
            outletSelected ? outletSelected : JSON.stringify({})
          );
          console.log(outletSelected);

          const payload = {
            pickup_id: outletSelected?.outlet_id,
            pickup_gps: outletSelected?.outlet_gps,
            pickup_location: outletSelected?.outlet_address,
            destination_location: value?.value?.description,
            destination_gps: stringCoordinates,
          };

          if (!isEmpty(outletSelected)) {
            const res = await axios.post("/api/delivery-charge", payload);

            let { data } = await res.data;
            const price = get(data, "price", 0);
            data = { ...data, price: Number(parseFloat(price)) };
            console.log({ data });
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

    if (value?.label) {
      getCoordinates();
    }

    return () => {};
  }, [outletSelected, value]);

  React.useEffect(() => {
    (async () => {
      const res = await axios.post("/api/outlets", {
        merchant: user["user_merchant_id"],
      });
      const data = res?.data?.data ?? [];
      setOutlets(data);
    })();
    return () => {};
  }, [setOutlets, user]);

  return (
    <div className="relative min-h-screen w-full">
      <Header>
        <div className="flex justify-between items-center h-full px-4">
          <Logo className="h-full" />
          <p>
            Complete the form with the details to initiate the delivery request
          </p>
          <div className="flex justify-between items-center w-1/5">
            <div className="flex justify-between items-center">
              <div className="mr-2">
                <ion-icon name="person" />
              </div>
              <h1>Happy Cup</h1>
            </div>

            <div className="flex justify-between items-center">
              <div className="mr-2">
                <ion-icon name="log-out" />
              </div>
              <Button
                btnText={"Logout"}
                btnClasses="shadow-none rounded-none"
                onClick={logoutUser}
              />
            </div>
          </div>
        </div>
      </Header>

      <div className="flex flex-col items-center absolute top-[100px] w-full">
        <div className="w-2/3">
          <CreateADelivery
            register={register}
            setValue={setValue}
            value={value}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateDelivery;
