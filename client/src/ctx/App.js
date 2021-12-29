import { createContext, useContext, useMemo, useReducer } from "react";

const initialState = {
  appLoading: true,
  outlets: [],
  activePayments: [],
  componentToRender: "",
  clientBookingDetails: {},
  provider: {},
  showHeader: false,
};

const AppContext = createContext();

const AppProvider = ({ children }) => {
  const reducer = (state, action) => {
    switch (action.type) {
      case "LOADING":
        return {
          ...state,
          appLoading: action.payload,
        };

      case "SET_OUTLETS":
        return {
          ...state,
          outlets: action.payload,
        };
      case "SET_ACTIVE_PAYMENTS":
        return {
          ...state,
          activePayments: action.payload,
        };
      case "COMPONENT_TO_RENDER":
        return {
          ...state,
          componentToRender: action.payload,
        };
      case "CLIENT_BOOKING_DETAILS":
        return {
          ...state,
          clientBookingDetails: {
            ...state.clientBookingDetails,
            ...action.payload,
          },
        };
      case "SET_PROVIDER_DETAILS":
        return {
          ...state,
          provider: {
            ...state.provider,
            ...action.payload,
          },
        };

      case "SHOW_HEADER":
        return {
          ...state,
          showHeader: action.payload,
        };
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  const actions = useMemo(
    () => ({
      setOutlets: (payload) =>
        dispatch({
          type: "SET_OUTLETS",
          payload,
        }),
      setActivePayments: (payload) =>
        dispatch({
          type: "SET_ACTIVE_PAYMENTS",
          payload,
        }),
      setAppLoading: (payload) =>
        dispatch({
          type: "LOADING",
          payload,
        }),
      setComponentToRender: (payload) =>
        dispatch({
          type: "COMPONENT_TO_RENDER",
          payload,
        }),
      setClientBookingDetails: (payload) => {
        dispatch({
          type: "CLIENT_BOOKING_DETAILS",
          payload,
        });
      },
      setProviderDetails: (payload) => {
        dispatch({
          type: "SET_PROVIDER_DETAILS",
          payload,
        });
      },
      setShowHeader: (payload) => {
        dispatch({
          type: "SHOW_HEADER",
          payload,
        });
      },
    }),
    []
  );

  const values = useMemo(
    () => ({
      state,
      actions,
    }),
    [actions, state]
  );

  return <AppContext.Provider value={values}>{children}</AppContext.Provider>;
};

export default AppProvider;
export const useApp = () => useContext(AppContext);
