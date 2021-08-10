import React from "react";
import { Table, Thead, Tbody, Tr, Th, Td } from "react-super-responsive-table";
import { format, startOfMonth } from "date-fns";

const ShowRequestDetail = ({ order, setShowDetails, setOrderToShow }) => {
  return (
    <div className="absolute top-[90px] w-full px-1 pb-10">
      <div>
        <button
          className="text-4xl"
          onClick={() => {
            setOrderToShow(null);
            setShowDetails(false);
          }}
        >
          &#8592;
        </button>
      </div>
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
          <Tr>
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
                ? order?.delivery_rider_name || "N/A"
                : "N/A"}
            </Td>
            <Td>{order?.total_amount}</Td>
            <Td>{order?.customer_name || "N/A"}</Td>
            <Td>{order?.recipient_contact}</Td>
            <Td>{order?.created_by_name}</Td>
          </Tr>
        </Tbody>
      </Table>
    </div>
  );
};

export default ShowRequestDetail;
