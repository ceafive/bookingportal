import React from "react";
import { useForm } from "react-hook-form";

import { verifyToken } from "../../utils/services";
import LoginForm from "../organisams/LoginForm";
import { useAuth } from "../../ctx/Auth";
import axios from "axios";
import Logo from "../atoms/Logo";

export default function Login() {
  const {
    register,
    handleSubmit,

    formState: { errors },
  } = useForm();

  const {
    actions: { loginUser },
  } = useAuth();

  const [processing, setProcessing] = React.useState(false);
  const [loginError, setLoginError] = React.useState({
    status: false,
    message: "",
  });

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
              Welcome back, enter your mobile number or username to continue
            </p>
          </div>

          <LoginForm
            errors={errors}
            handleSubmit={handleSubmit}
            handleUserSignIn={handleUserSignIn}
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
