import { useEffect } from "react";
import Spinner from "./components/atoms/Spinner";
import CreateDelivery from "./components/screens/CreateDelivery";
import Login from "./components/screens/Login";
import { useAuth } from "./ctx/Auth";

function App() {
  const {
    state: { isLoggedIn, loading, user },
    actions: { checkAuth },
  } = useAuth();
  console.log({ isLoggedIn, loading, user });

  useEffect(() => {
    checkAuth();
    return () => {};
  }, [checkAuth]);

  let ComponentToRender = <div>Hello</div>;

  if (loading) {
    ComponentToRender = Spinner;
  }

  if (!loading && !isLoggedIn) {
    ComponentToRender = Login;
  }

  if (!loading && isLoggedIn) {
    ComponentToRender = CreateDelivery;
  }

  return (
    <div className="flex flex-col justify-center items-center w-full min-h-screen">
      <ComponentToRender />
    </div>
  );
}

export default App;
