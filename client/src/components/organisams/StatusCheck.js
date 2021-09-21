import React from "react";
import { useApp } from "../../ctx/App";
import Button from "../atoms/Button";
import ButtonSpinner from "../molecules/ButtonSpinner";

const StatusCheck = ({
  statusText,
  setTicking,
  setLoading,
  loading,
  setConfirmButtonText,
  confirmButtonText,
  processError,
  reset,
  setStep,
  setProcessError,
}) => {
  const {
    actions: { setComponentToRender },
  } = useApp();

  return (
    <div className="text-center px-10">
      <div className="mb-5">
        <p>
          Delivery Order No:{" "}
          <span className="font-bold">{statusText?.order}</span>
        </p>
        <p>
          Payment Invoice No:{" "}
          <span className="font-bold">{statusText?.invoice}</span>
        </p>
      </div>

      {processError ? (
        <p
          dangerouslySetInnerHTML={{ __html: processError }}
          className={`text-center text-sm ${
            processError?.includes("Successful") ||
            processError?.includes("successfully")
              ? `text-green-500`
              : `text-red-500`
          } `}
        />
      ) : (
        <>
          <p className="font-bold">Instructions</p>
          <p dangerouslySetInnerHTML={{ __html: statusText?.message }} />
        </>
      )}

      <div className="mt-4">
        {(processError?.includes("Successful") ||
          processError?.includes("successfully") ||
          processError?.includes("Sorry")) && (
          <Button
            onClick={() => {
              setComponentToRender("track");
            }}
            btnText="Track Request"
            btnClasses="mb-2 bg-blue-800 text-white"
          />
        )}
        <ButtonSpinner
          processing={loading}
          onClick={() => {
            confirmButtonText
              ? (() => {
                  setStep(0);
                  setProcessError(false);
                  setConfirmButtonText("");
                  setTicking(false);
                  setLoading(false);
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
