import { useEffect } from "react";
import Spinner from "./components/atoms/Spinner";
import CreateDelivery from "./components/screens/CreateDelivery";
import Login from "./components/screens/Login";
import { useAuth } from "./ctx/Auth";
import ClosedMessage from "./components/screens/ClosedMessage";
import { Toaster } from "react-hot-toast";
import * as Sentry from "@sentry/react";

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
    state: { isLoggedIn, loading },
    actions: { checkAuth },
  } = useAuth();
  // console.log({ isLoggedIn, loading, user });

  const newDate = new Date();
  const startTime = "07:00:00";
  const endTime = "20:00:00";
  const currentTime = newDate.toLocaleTimeString("en-GB");

  const deliveryIsOpen =
    process.env.NODE_ENV === "production"
      ? currentTime > startTime && currentTime < endTime
      : true;
  // console.log(deliveryIsOpen);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  let ComponentToRender = <div>Hello</div>;

  if (loading) {
    ComponentToRender = Spinner;
  }

  if (!loading && !isLoggedIn) {
    ComponentToRender = Login;
  }

  if (!loading && isLoggedIn && !deliveryIsOpen) {
    ComponentToRender = ClosedMessage;
  }

  if (!loading && isLoggedIn && deliveryIsOpen) {
    ComponentToRender = CreateDelivery;
  }

  return (
    <Sentry.ErrorBoundary fallback={myFallback} showDialog>
      <div className="flex flex-col justify-center items-center w-full min-h-screen">
        <ComponentToRender width={30} height={30} />
        <Toaster />
      </div>
    </Sentry.ErrorBoundary>
  );
}

export default App;
