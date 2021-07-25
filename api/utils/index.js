const axios = require("axios");
const qs = require("qs");
const crypto = require("crypto");

function microtime() {
  return (Date.now ? Date.now() : new Date().getTime()) / 1000;
  // return now - 74545;
}

function getHash(string, key) {
  var hmac = crypto.createHmac("sha512", key);
  hmac.update(string);
  return hmac.digest("hex");
}

function getHeaders() {
  const timestamp = Math.round(microtime());
  const stringedTimestamp = String(timestamp);
  const appID = process.env.APP_ID;
  const appKey = process.env.APP_KEY;
  const authData = `${appID}:${stringedTimestamp}`;
  const authSecret = getHash(authData, appKey);

  return {
    Application: appID,
    Time: stringedTimestamp,
    Authentication: authSecret,
    Accept: "application/json",
    "content-type": "application/x-www-form-urlencoded",
  };
}

const axiosIPAY = axios.create({
  baseURL: "https://manage.ipaygh.com/apidev/v1/gateway",
  headers: { ...getHeaders() },
});

async function deleteHandler(req, res, url) {
  try {
    const iPayResponse = await axiosIPAY({
      url,
      method: "delete",
      headers: getHeaders(),
    });
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
    return res.status(error.response.status).json(errorResponse);
  }
}

async function postHandler(req, res, url, data, additionalHeaders = {}) {
  try {
    const iPayResponse = await axiosIPAY.post(url, qs.stringify(data), {
      headers: additionalHeaders,
    });
    console.log(iPayResponse);
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
    console.log(errorResponse);
    return res.status(400).json(errorResponse);
  }
}

async function putHandler(req, res, url, data, additionalHeaders = {}) {
  try {
    const iPayResponse = await axiosIPAY({
      url,
      method: "put",
      data,
      headers: { ...getHeaders(), ...additionalHeaders },
    });

    // console.log(iPayResponse);

    const iPayData = await iPayResponse.data;
    return res.status(200).json(iPayData);
  } catch (error) {
    // console.log(error);
    let errorResponse = "";
    if (error.response) {
      errorResponse = error.response.data;
    } else if (error.request) {
      errorResponse = error.request;
    } else {
      errorResponse = { error: error.message };
    }
    return res.status(error.response.status).json(errorResponse);
  }
}

async function getHandler(req, res, url) {
  try {
    const iPayResponse = await axiosIPAY.get(url);
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
    return res.status(error.response.status).json(errorResponse);
  }
}

module.exports = {
  postHandler,
  putHandler,
  deleteHandler,
  getHandler,
};
