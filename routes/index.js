const { default: axios } = require("axios");
var express = require("express");
const { postHandler, getHandler, putHandler } = require("../utils");
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
    // `stores/merchant/${merchant}/store/outlets/all/list`
    `stores/merchant/${merchant}/store/outlets/mobile/list`
  );
});

/* GET provider merchant details*/
router.post("/merchant-details", async function (req, res, next) {
  const { merchant } = req.body;

  return await getHandler(
    req,
    res,
    `/merchants/gateway/profile/ID/${merchant}`
  );
});

/* GET products*/
router.post("/products", async function (req, res, next) {
  const { merchant, outlet } = req.body;

  return await getHandler(
    req,
    res,
    `/stores/merchant/${merchant}/store/outlet/${outlet}/products`
  );
});

/* GET orders*/
router.post("/past-orders", async function (req, res, next) {
  const { merchant, date } = req.body;

  return await getHandler(
    req,
    res,
    `/orders/bookings/check/slots/${merchant}/${date}`
  );
});

/* GET provider details */
router.post("/provider-details", async function (req, res, next) {
  const { name } = req.body;
  return await getHandler(
    req,
    res,
    `/stores/merchant/bookings/online/${name}`
    // `stores/merchant/${merchant}/store/outlets/mobile/list`
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

/* GET check user */
router.post("/check-user", async function (req, res, next) {
  const { username } = req.body;
  return await getHandler(req, res, `login/pin/user/${username}`);
});

/* GET check user */
router.post("/setup-user-pin", async function (req, res, next) {
  return await putHandler(req, res, `/users/merchant/user/pin`, req.body);
});

/* GET customer details */
router.post("/customer-details", async function (req, res, next) {
  const { phone } = req.body;
  return await getHandler(req, res, `customers/customer/lookup/${phone}`);
});

/* POST raise order */
router.post("/raise-order", async function (req, res, next) {
  return await postHandler(req, res, `/orders/order/process`, req.body);
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

/* PoST order history */
router.post("/cancel-payment", async function (req, res, next) {
  return await putHandler(
    req,
    res,
    `/paybills/gateway/payment/request`,
    req.body
  );
});

module.exports = router;
