import { useEffect, useCallback } from "react";
import Spinner from "./components/atoms/Spinner";
import CreateDelivery from "./components/screens/CreateDelivery";
import Login from "./components/screens/Login";
import { useAuth } from "./ctx/Auth";
import ClosedMessage from "./components/screens/ClosedMessage";
import { Toaster } from "react-hot-toast";
import * as Sentry from "@sentry/react";
import { useApp } from "./ctx/App";
import Logo from "./components/atoms/Logo";
import Header from "./components/molecules/Header";
import Button from "./components/atoms/Button";
import TrackRequest from "./components/screens/TrackRequest";

function FallbackComponent() {
  return (
    <div className="flex flex-col justify-center items-center w-full min-h-screen">
      <p>An error has occurred</p>
      <button
        onClick={() => {
          window?.location?.reload();
        }}
      >
        Reload
      </button>
    </div>
  );
}

const myFallback = <FallbackComponent />;

function App() {
  const {
    state: { isLoggedIn, loading, user, showHeader },
    actions: { checkAuth, logoutUser },
  } = useAuth();

  const {
    state: { componentToRender },
    actions: { setComponentToRender },
  } = useApp();

  // console.log({ componentToRender });

  const newDate = new Date();
  const startTime = "07:00:00";
  const endTime = "20:00:00";
  const currentTime = newDate.toLocaleTimeString("en-GB");

  let deliveryIsOpen =
    process.env.NODE_ENV === "production"
      ? currentTime > startTime && currentTime < endTime
      : true;

  deliveryIsOpen = true; // TODO: temp fix
  // console.log(deliveryIsOpen);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const switchComponentToRender = useCallback(() => {
    switch (loading) {
      case true:
        return <Spinner key={1} width={30} height={30} />;
      case false:
        if (!isLoggedIn) {
          return <Login key={2} />;
        } else {
          if (!deliveryIsOpen) {
            return <ClosedMessage key={5} />;
          } else {
            if (componentToRender === "raise") {
              return <CreateDelivery key={3} />;
            }
            if (componentToRender === "track") {
              return <TrackRequest key={4} />;
            }
          }
        }
        break;
      default:
        return <div>Welcome To Digistore Deliveries</div>;
    }
  }, [componentToRender, deliveryIsOpen, isLoggedIn, loading]);

  return (
    <Sentry.ErrorBoundary fallback={myFallback} showDialog>
      <div className="flex flex-col justify-center items-center w-full min-h-screen">
        {showHeader && (
          <Header>
            <div className="h-full">
              <div className="flex justify-between items-center px-2">
                <div className="flex items-center">
                  <div className="w-28">
                    <Logo className="" />
                  </div>
                </div>

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
              <div className="flex justify-center items-center w-full text-sm mb-2">
                <div className="w-4/5 sm:w-2/3 flex justify-between items-center">
                  <button
                    className={`${
                      componentToRender === "raise"
                        ? "bg-gray-800 text-white"
                        : ""
                    } rounded px-4 py-1 transition-colors`}
                    onClick={() => {
                      setComponentToRender("raise");
                    }}
                  >
                    Raise Delivery
                  </button>
                  <button
                    className={`${
                      componentToRender === "track"
                        ? "bg-gray-800 text-white"
                        : ""
                    } rounded px-4 py-1  transition-colors`}
                    onClick={() => {
                      setComponentToRender("track");
                    }}
                  >
                    Track Deliveries
                  </button>
                </div>
              </div>
            </div>
          </Header>
        )}
        {switchComponentToRender()}
        {/* <ComponentToRender width={30} height={30} /> */}
        <Toaster />
      </div>
    </Sentry.ErrorBoundary>
  );
}

export default App;
