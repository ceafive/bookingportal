import React from "react";
import { format, startOfMonth } from "date-fns";

import { Table, Thead, Tbody, Tr, Th, Td } from "react-super-responsive-table";
import { useForm } from "react-hook-form";
import { useApp } from "../../ctx/App";
import { useAuth } from "../../ctx/Auth";
import axios from "axios";
import { filter } from "lodash";

export function TableExample({ orders }) {
  return (
    <>
      {" "}
      {orders?.length > 1 ? (
        <Table>
          <Thead>
            <Tr>
              <Th>Order No.</Th>
              <Th>Order Date</Th>
              <Th>Order Amount</Th>
              <Th>Discount</Th>
              <Th>Order Items</Th>
              <Th>Order Status</Th>
              <Th>Order Outlet</Th>
              <Th>Order Source</Th>
              <Th>Order Notes</Th>
              <Th>Order Invoice</Th>
              <Th>Delivery Type</Th>
              <Th>Delivery Fee</Th>
              <Th>Delivery Location</Th>
              <Th>Delivery Notes</Th>
              <Th>Delivery Rider</Th>
              <Th>Total Amount</Th>
              <Th>Customer Name</Th>
              <Th>Phone Number</Th>
              <Th>Created By</Th>
            </Tr>
          </Thead>

          <Tbody>
            {orders?.map((order) => {
              return (
                <Tr key={order?.order_no}>
                  <Td>{order?.order_no}</Td>
                  <Td>
                    {format(
                      new Date(order?.order_date ?? ""),
                      "iii, d MMM yy h:mmaaa"
                    )}
                  </Td>
                  <Td>{order?.order_amount}</Td>
                  <Td>{order?.order_discount}</Td>
                  <Td>{order?.order_items}</Td>
                  <Td>{order?.order_status_desc}</Td>
                  <Td>{order?.delivery_outlet}</Td>
                  <Td>{order?.order_source_desc}</Td>
                  <Td>{order?.customer_notes || "N/A"}</Td>
                  <Td>{order?.payment_invoice}</Td>
                  <Td>{order?.delivery_type}</Td>
                  <Td>{order?.delivery_charge}</Td>
                  <Td>{order?.delivery_location}</Td>
                  <Td>{order?.delivery_notes || "N/A"}</Td>
                  <Td>
                    {order?.delivery_type === "DELIVERY"
                      ? order?.delivery_rider_name
                      : "N/A"}
                  </Td>
                  <Td>{order?.total_amount}</Td>
                  <Td>{order?.customer_name}</Td>
                  <Td>{order?.recipient_contact}</Td>
                  <Td>{order?.created_by_name}</Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
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
  //   console.log(orders);

  const {
    state: { user },
    actions: {},
  } = useAuth();

  const {
    state: {},
    actions: {},
  } = useApp();

  React.useEffect(() => {
    const fetchItems = async () => {
      try {
        setFetching(true);
        const formCurrentValues = getValues();
        console.log(formCurrentValues);
        const data = {
          merchant: user?.user_merchant_id,
          start_date: format(formCurrentValues?.startDate, "dd-MM-yyyy"),
          end_date: format(formCurrentValues?.endDate, "dd-MM-yyyy"),
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

    fetchItems();
  }, []);

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

  return (
    <div className="relative min-h-screen w-full">
      <div className="absolute top-[100px] w-full pb-4 px-3">
        <div className="w-full">
          <div className="flex w-full justify-between items-center">
            <div className="flex w-full">
              <input
                className="form-input"
                {...register("startDate", {
                  required: `Start date required`,
                  valueAsDate: true,
                })}
                max={format(new Date(), "yyyy-MM-dd")}
                type="date"
                defaultValue={format(startOfMonth(new Date()), "yyyy-MM-dd")}
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
          <TableExample orders={orders} />
        </div>
      </div>
    </div>
  );
};

export default TrackRequest;
