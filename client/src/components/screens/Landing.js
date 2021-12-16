import React from "react";
import { useForm } from "react-hook-form";

import { verifyToken } from "../../utils/services";
import LoginForm from "../organisams/LoginForm";
import { useAuth } from "../../ctx/Auth";
import axios from "axios";
import Logo from "../atoms/Logo";
import toast from "react-hot-toast";
import LandingPage from "../organisams/LandingPage";

export default function Landing() {
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

  const [step, setStep] = React.useState(0);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen max-h-screen w-full max-w-7xl">
      <LandingPage />
    </div>
  );
}
