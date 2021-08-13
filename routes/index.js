const { default: axios } = require("axios");
var express = require("express");
const { postHandler, getHandler } = require("../utils");
var router = express.Router();

/* LOGIN user */
router.post("/login", async function (req, res, next) {
  return await postHandler(req, res, "login/merchant/pin", req.body);
});

/* GET outlets */
router.post("/outlets", async function (req, res, next) {
  const { merchant } = req.body;
  return await getHandler(
    req,
    res,
    `stores/merchant/${merchant}/store/outlets/mobile/list`
  );
});

/* POST delivery charge */
router.post("/delivery-charge", async function (req, res, next) {
  return await postHandler(
    req,
    res,
    `/orders/order/process/delivery/route/charge`,
    req.body
  );
});

/* GET delivery charge */
router.post("/coordinates", async function (req, res, next) {
  const { deliveryInputValue } = req.body;
  try {
    // const iPayResponse = await axios.get(
    //   `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${deliveryInputValue.value.description}&inputtype=textquery&fields=geometry&key=AIzaSyCwlbBlciY3kB52y5_h0k4Zxmi8Ho4zK3M`
    // ); // TODO: old url, sometimes returns not results for some locations

    const iPayResponse = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${deliveryInputValue.value.description}&fields=geometry&region=GH&key=AIzaSyCwlbBlciY3kB52y5_h0k4Zxmi8Ho4zK3M`
    );

    const iPayData = await iPayResponse.data;
    return res.status(200).json(iPayData);
  } catch (error) {
    let errorResponse = "";
    if (error.response) {
      errorResponse = error.response.data;
    } else if (error.request) {
      errorResponse = error.request;
    } else {
      errorResponse = { error: error.message };
    }
    return res.status(400).json(errorResponse);
  }
});

/* GET active payments */
router.post("/active-payments", async function (req, res, next) {
  return await getHandler(req, res, `vendors/payment/services/active`);
});

/* GET active payments */
router.post("/transaction-fees", async function (req, res, next) {
  const { channel, amount, merchant } = req.body;
  return await getHandler(
    req,
    res,
    `vendors/service/charge/${channel}/${amount}/${merchant}`
  );
});

/* GET customer details */
router.post("/customer-details", async function (req, res, next) {
  const { phone } = req.body;
  return await getHandler(req, res, `customers/customer/lookups/${phone}`);
});

/* POST raise order */
router.post("/raise-order", async function (req, res, next) {
  return await postHandler(req, res, `/orders/delivery/process`, req.body);
});

/* GET verify transaction */
router.post("/verify-transaction", async function (req, res, next) {
  const { merchantKey, trxID } = req.body;
  return await getHandler(
    req,
    res,
    `/paybills/payment/gateway/status/${merchantKey}/${trxID}`
  );
});

/* POST process payment */
router.post("/process-payment", async function (req, res, next) {
  return await postHandler(req, res, `/orders/payment/process`, req.body);
});

/* POST add customer */
router.post("/add-customer", async function (req, res, next) {
  return await postHandler(req, res, `/customers/merchant/customer`, req.body);
});

/* GET order history */
router.post("/get-orders", async function (req, res, next) {
  const { merchant, start_date, end_date } = req.body;
  // console.log({ merchant, start_date, end_date });
  return await getHandler(
    req,
    res,
    `/orders/delivery/process/${merchant}/list/${start_date}/${end_date}`
  );
});

module.exports = router;
