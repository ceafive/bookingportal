import { createContext, useContext, useMemo, useReducer } from "react";

const initialState = {
  loading: true,
  isLoggedIn: false,
  user: null,
  showHeader: false,
};

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const reducer = (state, action) => {
    switch (action.type) {
      case "LOADING":
        return {
          ...state,
          loading: action.payload,
        };

      case "CHECK_AUTH":
        let user = sessionStorage.getItem("IPAYDELIVERYPOSUSER");
        user = JSON.parse(user);

        if (user) {
          return {
            ...state,
            loading: false,
            isLoggedIn: true,
            user,
            showHeader: true,
          };
        } else {
          return {
            ...state,
            loading: false,
            isLoggedIn: false,
            user: null,
            showHeader: false,
          };
        }

      case "LOGIN":
        return {
          ...state,
          loading: false,
          isLoggedIn: "verified" in action.payload ? true : false,
          user: "user" in action.payload ? action.payload.user : null,
          showHeader: true,
        };

      case "LOGOUT":
        sessionStorage.removeItem("IPAYDELIVERYPOSUSER");
        return {
          ...state,
          loading: false,
          isLoggedIn: false,
          user: null,
          showHeader: false,
        };
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  const actions = useMemo(
    () => ({
      loginUser: (payload) =>
        dispatch({
          type: "LOGIN",
          payload,
        }),
      logoutUser: (payload) =>
        dispatch({
          type: "LOGOUT",
          payload,
        }),
      setLoading: (payload) =>
        dispatch({
          type: "LOADING",
          payload,
        }),
      checkAuth: () =>
        dispatch({
          type: "CHECK_AUTH",
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

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
export const useAuth = () => useContext(AuthContext);
