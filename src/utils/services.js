export const verifyToken = (response) => {
  const { status, message } = response;

  if (status && Number(status) === 99) {
    return {
      error: message,
      success: false,
    };
  }

  if (status && Number(status) === 0) {
    sessionStorage.setItem("IPAYDELIVERYPOSUSER", JSON.stringify(response));
    const returnData = {
      error: false,
      success: message,
    };

    if ("sid" in response) {
      returnData["verified"] = true;
      returnData["user"] = response;
    }

    return returnData;
  }
};
