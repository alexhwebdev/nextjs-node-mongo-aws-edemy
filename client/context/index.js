"use client"
import { useReducer, createContext, useEffect } from "react";
import axios from "axios";
import { useRouter, userRouter } from "next/navigation";

// initial state
const intialState = {
  user: null,
};

// create context
const Context = createContext();

// root reducer. Updates the state and accesses data from state
const rootReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN":
      return { ...state, user: action.payload };
    case "LOGOUT":
      return { ...state, user: null };
    default:
      return state;
  }
};

// context provider
const Provider = ({ children }) => {
  const [state, dispatch] = useReducer(
    rootReducer, intialState
  );

  const router = useRouter();

  // Access user data from localStorage since refreshing page would make user: null
  useEffect(() => {
    dispatch({
      type: "LOGIN",
      payload: JSON.parse(
        window.localStorage.getItem("user")
      ),
    });
  }, []);

  axios.interceptors.response.use(
    function (response) {
      // any status code that 'lie within the range' 
      // of 2XX cause this function to trigger
      return response;
    },
    function (error) {
      // any status codes that 'falls outside the range'
      // of 2xx cause this function to trigger
      let res = error.response;
      if (res.status === 401 && res.config && !res.config.__isRetryRequest) {
        return new Promise((resolve, reject) => {
          axios
            // .get("/api/logout")
            .get(`${process.env.NEXT_PUBLIC_API}/logout`)
            .then((data) => {
              console.log("/401 error > logout");
              dispatch({ type: "LOGOUT" });
              window.localStorage.removeItem("user");
              router.push("/login");
            })
            .catch((err) => {
              console.log("AXIOS INTERCEPTORS ERR", err);
              reject(error);
            });
        });
      }
      return Promise.reject(error);
    }
  );

  useEffect(() => {
    const getCsrfToken = async () => {
      // const { data } = await axios.get("/api/csrf-token");
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/csrf-token`
      );
      console.log("CSRF data", data);
      // axios.defaults.headers["X-CSRF-Token"] = data.getCsrfToken;
      axios.defaults.headers.common['X-CSRF-Token'] = data.getCsrfToken;
      axios.defaults.withCredentials = true; // Ensure cookies are sent with requests
    };
    getCsrfToken();
  }, []);

  return (
    <Context.Provider value={{ state, dispatch }}>
      {children}
    </Context.Provider>
  );
};

export { Context, Provider };