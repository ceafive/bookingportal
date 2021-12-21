import { useEffect, useCallback } from "react";
import Spinner from "./components/atoms/Spinner";
import { useAuth } from "./ctx/Auth";
import { Toaster } from "react-hot-toast";
import * as Sentry from "@sentry/react";
import { useApp } from "./ctx/App";
import Logo from "./components/atoms/Logo";
import Header from "./components/molecules/Header";
import Button from "./components/atoms/Button";
import Landing from "./components/screens/Landing";
import Schedule from "./components/screens/Schedule";
import Book from "./components/screens/Book";
import Payment from "./components/screens/Payment";
import BookingConfirm from "./components/screens/BookingConfirm";
import axios from "axios";
import { isEmpty } from "lodash";

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
    state: { user, showHeader },
    actions: { logoutUser },
  } = useAuth();

  const {
    state: { componentToRender, provider },
    actions: { setComponentToRender, setProviderDetails },
  } = useApp();

  function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return "";
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }

  useEffect(() => {
    var providerName = getParameterByName("provider");
    if (!providerName) {
      return setComponentToRender(null);
    }

    (async () => {
      const resProvider = await axios.post("/api/provider-details", {
        name: providerName,
      });
      const resProviderData = resProvider?.data ?? {};

      if (Number(resProviderData?.status) !== 0) {
        return setComponentToRender(null);
      }

      setProviderDetails({
        providerDetails: resProviderData?.data,
      });

      const merchantDetailsRes = await axios.post("/api/merchant-details", {
        merchant: resProviderData?.data?.store_merchant,
      });
      const merchantDetailsResData = merchantDetailsRes?.data ?? {};

      if (Number(merchantDetailsResData?.status) === 0) {
        setProviderDetails({
          providerMerchantDetails: merchantDetailsResData.data,
        });
      }

      const outletsRes = await axios.post("/api/outlets", {
        merchant: resProviderData?.data?.store_merchant,
      });
      const outletsResData = outletsRes?.data ?? [];

      if (Number(outletsResData?.status) === 0) {
        setProviderDetails({
          providerOutletDetails: outletsResData?.data,
        });

        const productsRes = await axios.post("/api/products", {
          merchant: resProviderData?.data?.store_merchant,
          outlet: outletsResData?.data[0]?.outlet_id,
        });
        const productsResData = productsRes?.data ?? [];

        if (Number(productsResData?.status) === 0) {
          setProviderDetails({
            providerProducts: productsResData?.data,
          });
        }
      }
    })();
  }, [setComponentToRender, setProviderDetails]);

  useEffect(() => {
    // all data loaded
    const {
      providerDetails,
      providerOutletDetails,
      providerProducts,
      providerMerchantDetails,
    } = provider;

    // console.log(providerMerchantDetails);

    if (
      !isEmpty(providerDetails) &&
      !isEmpty(providerOutletDetails) &&
      !isEmpty(providerProducts) &&
      !isEmpty(providerMerchantDetails)
    ) {
      setComponentToRender("schedule");
    }
  }, [provider, setComponentToRender]);

  const switchComponentToRender = useCallback(() => {
    if (componentToRender === "") {
      return <Spinner key={1} />;
    }
    if (componentToRender === "landing") {
      return <Landing key={2} />;
    }
    if (componentToRender === "schedule") {
      return <Schedule key={3} />;
    }
    if (componentToRender === "book") {
      return <Book key={4} />;
    }
    if (componentToRender === "payment") {
      return <Payment key={5} />;
    }
    if (componentToRender === "booking-confirm") {
      return <BookingConfirm key={6} />;
    }

    if (componentToRender === null) {
      return <p>No Provider Found</p>;
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
