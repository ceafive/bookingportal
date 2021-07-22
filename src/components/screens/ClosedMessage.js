import React from "react";
import { useAuth } from "../../ctx/Auth";
import Button from "../atoms/Button";
import Logo from "../atoms/Logo";
import Header from "../molecules/Header";

const ClosedMessage = () => {
  const {
    state: { isLoggedIn, loading, user },
    actions: { checkAuth, logoutUser },
  } = useAuth();
  return (
    <div>
      <Header>
        <div className="flex justify-between items-center h-full px-1">
          <div className="flex items-center">
            <div className="w-28">
              <Logo className="" />
            </div>
          </div>

          {/* <p>
            Complete the form with the details to initiate the delivery request
          </p> */}
          <div className="flex justify-between items-center text-sm">
            <div className="flex justify-between items-center mr-2">
              <div className="mr-1">
                <ion-icon name="person" />
              </div>
              <h1 className="-mt-1">{user?.user_merchant}</h1>
            </div>

            <div className="flex justify-between items-center">
              <div className="mr-1">
                <ion-icon name="log-out" />
              </div>
              <Button
                btnText={"Logout"}
                btnClasses="!shadow-none !rounded-none !p-0 !-mt-1"
                onClick={logoutUser}
              />
            </div>
          </div>
        </div>
      </Header>
      <div className="flex justify-center items-center w-full mb-3">
        <div className="w-48">
          <Logo className="" />
        </div>
      </div>

      <p>Sorry! Delivery closed for the day</p>
    </div>
  );
};

export default ClosedMessage;
