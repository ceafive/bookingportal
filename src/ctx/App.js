import { createContext, useContext, useMemo, useReducer } from "react";

const initialState = {
  appLoading: true,
  outlets: [],
  activePayments: [],
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

      // case 'SET_CURRENT_DELIVERY_LOCATION'

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
