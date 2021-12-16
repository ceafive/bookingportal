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
import Landing from "./components/screens/Landing";
import Schedule from "./components/screens/Schedule";

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

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const switchComponentToRender = useCallback(() => {
    if (componentToRender === "landing") {
      return <Landing key={2} />;
    }
    if (componentToRender === "schedule") {
      return <Schedule key={3} />;
    }
    if (componentToRender === "track") {
      return <TrackRequest key={4} />;
    }
  }, [componentToRender]);

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
        <Toaster />
      </div>
    </Sentry.ErrorBoundary>
  );
}

export default App;
