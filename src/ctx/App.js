import { createContext, useContext, useMemo, useReducer } from "react";

const initialState = {
  appLoading: true,
  outlets: [],
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
