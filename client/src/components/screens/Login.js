import React from "react";
import { useForm } from "react-hook-form";

import { verifyToken } from "../../utils/services";
import LoginForm from "../organisams/LoginForm";
import { useAuth } from "../../ctx/Auth";
import axios from "axios";
import Logo from "../atoms/Logo";
import toast from "react-hot-toast";

export default function Login() {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm();

  const pin = React.useRef({});
  pin.current = watch("pin", "");

  const {
    actions: { loginUser },
  } = useAuth();

  const [processing, setProcessing] = React.useState(false); 
  const [loginError, setLoginError] = React.useState({
    status: false,
    message: "",
  });
  const [displayMessage, setDisplayMessage] = React.useState(
    "Welcome back, enter your mobile number or username to continue"
  );
  const [step, setStep] = React.useState(0);

  //

  const handleUserSignIn = async (values) => {
    try {
      setProcessing(true);
      setLoginError({
        status: false,
        message: "",
      });

      // console.log(values);

      const res = await axios.post("/api/login", values);
      const data = verifyToken(res?.data);

      if (data?.error) {
        setLoginError({
          status: true,
          message: data?.error,
        });
      }

      if (data?.success) {
        loginUser(data);
      }
    } catch (error) {
      setLoginError({
        status: false,
        message: "ERROR",
      });

      if (error.response) {
        console.log(error.response);
      } else if (error.request) {
        console.log(error.request);
      } else {
        console.log("Error", error.message);
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleGetUserLoginDetails = async (values) => {
    try {
      setProcessing(true);
      setLoginError({
        status: false,
        message: "",
      });
      const res = await axios.post("/api/check-user", {
        username: values?.username,
      });
      const { status, message, has_pin, uid } = await res.data;
      // console.log(res.data);

      if (Number(status) !== 0) {
        return toast.success(message);
      }

      if (has_pin === "NO") {
        setDisplayMessage(
          `Setup 4 digit PIN code to enable easy access to your account using ${values?.username}`
        );
        setValue("uid", uid);
        return setStep(1);
      }

      setStep(2);
    } catch (error) {
      setLoginError({
        status: false,
        message: "ERROR",
      });
      if (error.response) {
        console.log(error.response.data);
      } else if (error.request) {
        console.log(error.request);
      } else {
        console.log("Error", error.message);
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleSetupUserPIN = async (values) => {
    try {
      setProcessing(true);
      setLoginError({
        status: false,
        message: "",
      });

      const data = {
        username: values?.username,
        uid: values?.uid,
        pin: values?.pin,
        new_pin: values?.pin,
      };

      // console.log(data);

      const res = await axios.post("/api/setup-user-pin", data);
      const { status, message } = await res.data;
      // console.log({ status, message });

      if (Number(status) !== 0) {
        return toast.error(message);
      }
      await handleUserSignIn(data);
    } catch (error) {
      setLoginError({
        status: false,
        message: "ERROR",
      });
      if (error.response) {
        console.log(error.response.data);
      } else if (error.request) {
        console.log(error.request);
      } else {
        console.log("Error", error.message);
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen w-full">
      <div className="w-full lg:w-4/12 px-2">
        <div className="flex flex-col w-full">
          <div className="">
            <div className="flex justify-center items-center w-full mb-3">
              <div className="w-48">
                <Logo className="" />
              </div>
            </div>

            <p className="text-sm text-gray-700 text-center mb-6 px-6">
              {displayMessage}
            </p>
          </div>

          <LoginForm
            pin={pin}
            step={step}
            errors={errors}
            handleSubmit={handleSubmit}
            handleUserSignIn={handleUserSignIn}
            handleGetUserLoginDetails={handleGetUserLoginDetails}
            handleSetupUserPIN={handleSetupUserPIN}
            loginError={loginError}
            processing={processing}
            register={register}
            btnClasses={`${
              processing
                ? "bg-gray-300 text-gray-200"
                : "bg-green-500 text-white"
            } uppercase !py-2`}
          />
        </div>
      </div>
    </div>
  );
}
