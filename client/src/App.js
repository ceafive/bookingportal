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
    state: {
      componentToRender,
      provider,
      provider: { providerMerchantDetails, providerDetails },
      showHeader,
    },
    actions: { setComponentToRender, setProviderDetails, setShowHeader },
  } = useApp();

  // console.log(componentToRender);

  useEffect(() => {
    // var providerName = getParameterByName("provider");
    const providerName = window?.location?.pathname?.substring(1);
    // console.log({ providerName });

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

    // console.log(providerDetails);
    // console.log(providerMerchantDetails);
    // console.log(providerProducts);
    // console.log(providerOutletDetails);

    if (providerDetails && providerDetails?.store_category !== "BOOKINGS") {
      return setComponentToRender(null);
    }

    if (
      !isEmpty(providerDetails) &&
      !isEmpty(providerOutletDetails) &&
      !isEmpty(providerProducts) &&
      !isEmpty(providerMerchantDetails)
    ) {
      setComponentToRender("schedule");
      setShowHeader(true);
    }
  }, [provider, setComponentToRender, setShowHeader]);

  const switchComponentToRender = useCallback(() => {
    if (componentToRender === "") {
      return (
        <div className="min-h-screen flex justify-center items-center">
          <Spinner key={1} />
        </div>
      );
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
      return (
        <div className="min-h-screen flex justify-center items-center">
          <p>No Provider Found</p>
        </div>
      );
    }
  }, [componentToRender]);

  return (
    <Sentry.ErrorBoundary fallback={myFallback} showDialog>
      <div className="flex flex-col items-center w-full pt-5 pb-10">
        {showHeader && (
          <div className="px-2">
            <div className="flex justify-center w-full">
              <Logo className="" src={providerMerchantDetails?.merchant_logo} />
            </div>

            <div className="my-1 text-center">
              <h1>{providerDetails?.store_name}</h1>
            </div>
          </div>
        )}
        {switchComponentToRender()}
        <Toaster />
      </div>
    </Sentry.ErrorBoundary>
  );
}

export default App;
