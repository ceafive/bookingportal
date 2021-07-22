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
  append,
}) => {
  return (
    <div className="text-center px-10">
      <p className="my-4 font-bold">Transaction ID: {statusText?.invoice} </p>
      {processError ? (
        <p className="text-center text-red-500 text-sm">{processError}</p>
      ) : (
        <>
          <p className="font-bold">Instructions</p>
          <p dangerouslySetInnerHTML={{ __html: statusText?.message }} />
        </>
      )}

      <div className="mt-4">
        <ButtonSpinner
          processing={fetching}
          onClick={() => {
            confirmButtonText
              ? (() => {
                  setStep(0);
                  reset(
                    {
                      deliveries: [
                        {
                          number: "",
                          items: "",
                          notes: "",
                        },
                      ],
                    },
                    {
                      keepDefaultValues: true,
                    }
                  );
                })()
              : setTicking(true);
          }}
          btnText={confirmButtonText ? confirmButtonText : "Confirm Payment"}
          btnClasses="capitalize font-medium"
        />
      </div>
    </div>
  );
};

export default StatusCheck;
