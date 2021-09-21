import React from "react";
import InputWithLabel from "../molecules/InputWithLabel";
import ErrorMessage from "../atoms/ErrorMessage";
import ButtonSpinner from "../molecules/ButtonSpinner";

const LoginForm = ({
  register,
  errors,
  loginError,
  processing,
  handleSubmit,
  handleUserSignIn,
  handleGetUserLoginDetails,
  handleSetupUserPIN,
  btnClasses,
  spinnerProps,
  step,
  pin,
}) => {
  return (
    <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
      <form>
        <div className="w-full mb-3">
          <InputWithLabel
            labelText={"Username"}
            labelClasses="!capitalize"
            inputClasses="!pt-2 !p-0 !rounded-none !border-b !border-gray-500 !shadow-none hover:focus:!ring-0"
            {...register("username", {
              required: "Username is required",
            })}
            type="text"
            placeholder="kofi_amankwah"
          />
          <ErrorMessage text={errors?.username?.message} />
        </div>

        {(step === 1 || step === 2) && (
          <div className="w-full mb-3">
            <InputWithLabel
              labelText={"Pin"}
              labelClasses="!capitalize"
              inputClasses="!pt-2 !p-0 !rounded-none !border-b !border-gray-500 !shadow-none hover:focus:!ring-0"
              {...register("pin", {
                required: "PIN is required",
                minLength: {
                  value: 4,
                  message: "PIN must be longer than 3 chars",
                },
              })}
              type="password"
              pattern="[0-9]*"
              noValidate
              placeholder="1234"
            />
            <ErrorMessage text={errors?.pin?.message} />
          </div>
        )}

        {step === 1 && (
          <div className="relative w-full mb-3">
            <InputWithLabel
              labelText={"Confirm Pin"}
              labelClasses="!capitalize"
              inputClasses="!pt-2 !p-0 !rounded-none !border-b !border-gray-500 !shadow-none hover:focus:!ring-0"
              {...register("confirmPin", {
                required: "Confirmation PIN is required",
                validate: (value) =>
                  value === pin.current || `Confirm PIN is not equal to PIN`,
                minLength: {
                  value: 4,
                  message: "Confirmation PIN must be longer than 3 chars",
                },
              })}
              type="password"
              pattern="[0-9]*"
              noValidate
              placeholder="Confirm your 4 digit PIN Code"
            />
            <ErrorMessage text={errors?.confirmPin?.message} />
          </div>
        )}

        <div className="text-center mt-6">
          {loginError.status && <ErrorMessage text={loginError.message} />}
          <ButtonSpinner
            btnText="Sign In"
            processing={processing}
            onClick={handleSubmit(
              step === 0
                ? handleGetUserLoginDetails
                : step === 1
                ? handleSetupUserPIN
                : handleUserSignIn
            )}
            btnClasses={btnClasses}
            spinnerProps={spinnerProps}
          />
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
