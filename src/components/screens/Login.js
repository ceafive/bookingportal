import React from "react";
import { useForm } from "react-hook-form";

import { verifyToken } from "../../utils/services";
import LoginForm from "../organisams/LoginForm";
import { useAuth } from "../../ctx/Auth";
import axios from "axios";

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
    <div
      className="flex flex-col justify-center items-center min-h-screen w-full"
      style={{
        backgroundColor: "#8BC6EC",
        backgroundImage: `linear-gradient(135deg, #8BC6EC 0%, #9599E2 100%)`,
      }}
    >
      <div className="w-full lg:w-4/12 px-4">
        <div className="flex flex-col w-full shadow-lg rounded-lg bg-white">
          <div className="rounded-t px-6 py-6">
            <div className="text-center mb-3">
              <h6 className="text-gray-500 text-sm font-bold">Sign in with</h6>
            </div>

            <hr className="mt-6 border-b-1 border-gray-300" />
          </div>

          <LoginForm
            errors={errors}
            handleSubmit={handleSubmit}
            handleUserSignIn={handleUserSignIn}
            loginError={loginError}
            processing={processing}
            register={register}
            btnClasses="bg-green-200 lowercase"
          />
        </div>
      </div>
    </div>
  );
}
