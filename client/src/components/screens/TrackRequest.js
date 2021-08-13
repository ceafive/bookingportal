import React from "react";
import { format, startOfQuarter } from "date-fns";

import { useForm } from "react-hook-form";
import { useAuth } from "../../ctx/Auth";
import axios from "axios";
import { capitalize, filter, upperCase } from "lodash";
import ShowRequestDetail from "./ShowRequestDetail";

const statusColors = {
  NEW: "blue-500",
  CANCELLED: "red-500",
  DELIVERED: "green-500",
};

export function TableExample({ orders, setShowDetails, setOrderToShow }) {
  // console.log(orders);
  return (
    <>
      {orders?.length > 1 ? (
        <>
          {orders?.map((order) => {
            return (
              <div key={order?.order_no}>
                <div
                  key={order?.order_no}
                  className="flex justify-between w-full mt-2 px-2 text-xs text-gray-700"
                >
                  <div className="flex items-center">
                    <div className="mr-5">
                      <button
                        className="outline-none text-lg"
                        onClick={() => {
                          setOrderToShow(order);
                          setShowDetails(true);
                        }}
                      >
                        <ion-icon name="eye-outline" className="text-lg" />
                      </button>
                    </div>
                    <div>
                      <p>Invoice: {order?.order_no}</p>
                      <p>Date: {order?.order_date}</p>
                      <p>Delivery Amount: {order?.delivery_charge || ""}</p>
                    </div>
                  </div>
                  <div className="justify-end">
                    <p className="font-bold text-right">
                      GHS{order?.total_amount}
                    </p>
                    <p
                      className={`font-bold text-right text-${
                        statusColors[order?.order_status_desc]
                      }`}
                    >
                      {order?.order_status_desc}
                    </p>
                  </div>
                </div>
                <div className="h-[1px] bg-gray-100"></div>
              </div>
            );
          })}
        </>
      ) : (
        <p className="text-center">No items</p>
      )}
    </>
  );
}

const TrackRequest = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm({
    mode: "all",
    defaultValues: {
      //   startDate: format(startOfMonth(new Date()), "yyyy-MM-dd"),
      //   endDate: format(new Date(), "yyyy-MM-dd"),
      outletSelected: "All",
    },
  });
  const [fetching, setFetching] = React.useState(false);
  const [orders, setOrders] = React.useState([]);
  const [showDetails, setShowDetails] = React.useState(false);
  const [orderToShow, setOrderToShow] = React.useState(null);
  //   console.log(orders);

  const {
    state: { user },
  } = useAuth();

  React.useEffect(() => {
    const fetchItems = async () => {
      try {
        setFetching(true);
        const formCurrentValues = getValues();
        // console.log(formCurrentValues);
        const data = {
          merchant: user?.user_merchant_id,
          start_date: format(formCurrentValues?.startDate, "dd-MM-yyyy"),
          end_date: format(formCurrentValues?.endDate, "dd-MM-yyyy"),
        };

        // console.log(data);

        const allOrdersRes = await axios.post("/api/get-orders", data);
        const { data: allOrdersResData } = await allOrdersRes.data;

        setOrders(filter(allOrdersResData, Boolean));
      } catch (error) {
        console.log(error);
      } finally {
        setFetching(false);
      }
    };

    fetchItems();
  }, [getValues, user?.user_merchant_id]);

  const handleSubmitQuery = async (values) => {
    try {
      setFetching(true);
      //   console.log(values);
      const data = {
        merchant: user?.user_merchant_id,
        start_date: format(values?.startDate, "dd-MM-yyy"),
        end_date: format(values?.endDate, "dd-MM-yyyy"),
      };

      const allOrdersRes = await axios.post("/api/get-orders", data);
      const { data: allOrdersResData } = await allOrdersRes.data;
      setOrders(filter(allOrdersResData, Boolean));
    } catch (error) {
      console.log(error);
    } finally {
      setFetching(false);
    }
  };

  if (showDetails && orderToShow) {
    return (
      <ShowRequestDetail
        order={orderToShow}
        setShowDetails={setShowDetails}
        setOrderToShow={setOrderToShow}
      />
    );
  }

  return (
    <div className="relative min-h-screen w-full">
      <div className="absolute top-[100px] w-full pb-4">
        <div className="w-full px-3">
          <div className="flex w-full sm:w-auto justify-center items-center">
            <div className="flex w-full sm:w-auto">
              <input
                className="form-input"
                {...register("startDate", {
                  required: `Start date required`,
                  valueAsDate: true,
                })}
                max={format(new Date(), "yyyy-MM-dd")}
                type="date"
                defaultValue={format(startOfQuarter(new Date()), "yyyy-MM-dd")}
                // defaultValue={format(startOfMonth(new Date()), "yyyy-MM-dd")}
              />
              <p className="text-red-500 text-xs">
                {errors?.startDate?.message}
              </p>

              <input
                className="form-input"
                {...register("endDate", {
                  required: `End date required`,
                  valueAsDate: true,
                })}
                type="date"
                defaultValue={format(new Date(), "yyyy-MM-dd")}
                // min={format(new Date(), "yyyy-MM-dd")}
              />
              <p className="text-red-500 text-xs">{errors?.endDate?.message}</p>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              disabled={fetching}
              className={`${
                fetching
                  ? `bg-gray-200`
                  : `bg-blue-600 focus:ring focus:ring-blue-500`
              } py-1 rounded text-white focus:outline-none mt-2 w-full`}
              onClick={handleSubmit(handleSubmitQuery)}
            >
              Query
            </button>
          </div>
        </div>

        <div className="mt-4">
          <TableExample
            orders={orders}
            setShowDetails={setShowDetails}
            setOrderToShow={setOrderToShow}
          />
        </div>
      </div>
    </div>
  );
};

export default TrackRequest;
