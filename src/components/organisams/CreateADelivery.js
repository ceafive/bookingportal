import React from "react";
import { useApp } from "../../ctx/App";
import Select from "../atoms/Select";
import Input from "../atoms/Input";
import Label from "../molecules/Label";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";

const CreateADelivery = ({ register, value, setValue }) => {
  const {
    state: { outlets },
  } = useApp();

  const outletsData = outlets?.map((outlet) => {
    return {
      name: outlet?.outlet_name,
      value: JSON.stringify(outlet),
      props: {},
    };
  });

  return (
    <>
      <div className="w-full">
        <Label text="Pickup Location/Outlet" />
        <Select
          selectClasses="px-4"
          {...register("outletSelected")}
          data={[
            {
              name: `Select the pickup location`,
              value: JSON.stringify({}),
              props: {
                // disabled: true,
              },
            },
          ].concat(outletsData)}
        />
      </div>

      <div className="flex items-center w-full">
        <div>
          <Label text="Delivery Location" />
          <GooglePlacesAutocomplete
            selectProps={{
              // className: "focus:ring-1",
              placeholder: "Search for the delivery location",
              value,
              onChange: setValue,
            }}
          />
        </div>

        <div>
          <p>Distance: </p>
          <p>Delivery Fee: </p>
        </div>
      </div>

      <div className="w-full">
        <Label text="Recipient Number" />
        <Input placeholder="Enter recipient's number" />
      </div>
    </>
  );
};

export default CreateADelivery;
