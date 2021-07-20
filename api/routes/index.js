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
  const { value } = req.body;
  try {
    const iPayResponse = await axios.get(
      `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=%${value.value.description}&inputtype=textquery&fields=geometry&key=AIzaSyCwlbBlciY3kB52y5_h0k4Zxmi8Ho4zK3M`
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

module.exports = router;
