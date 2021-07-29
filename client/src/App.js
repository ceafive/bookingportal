import { useEffect } from "react";
import Spinner from "./components/atoms/Spinner";
import CreateDelivery from "./components/screens/CreateDelivery";
import Login from "./components/screens/Login";
import { useAuth } from "./ctx/Auth";
import ClosedMessage from "./components/screens/ClosedMessage";
import { Toaster } from "react-hot-toast";

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

  // const deliveryIsOpen = true;
  const deliveryIsOpen = currentTime > startTime && currentTime < endTime;
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
    <div className="flex flex-col justify-center items-center w-full min-h-screen">
      <ComponentToRender width={30} height={30} />
      <Toaster />
    </div>
  );
}

export default App;
