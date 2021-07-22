import React from "react";
import ButtonSpinner from "../molecules/ButtonSpinner";

const StatusCheck = ({
  statusText,
  fetching,
  setFetching,
  setTicking,
  setLoading,
  loading,
  ticking,
  setConfirmButtonText,
  confirmButtonText,
  processError,
  reset,
  setStep,
}) => {
  return (
    <div className="text-center px-10">
      <p className="my-4 font-bold">Transaction ID: {statusText?.invoice} </p>
      <p className="font-bold">Instructions</p>
      <p>{statusText?.message}</p>

      <div className="mt-4">
        <ButtonSpinner
          processing={fetching}
          onClick={() => {
            confirmButtonText
              ? (() => {
                  setStep(0);
                  reset();
                })()
              : setTicking(true);
          }}
          btnText={confirmButtonText ? confirmButtonText : "Confirm Payment"}
          btnClasses="capitalize font-medium"
        />
        {processError && (
          <p className="text-center text-red-500 text-sm">{processError}</p>
        )}
      </div>
    </div>
  );
};

export default StatusCheck;
