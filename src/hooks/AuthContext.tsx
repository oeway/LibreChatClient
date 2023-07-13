import {
  useState,
  useEffect,
  useMemo,
  ReactNode,
  useCallback,
  createContext,
  useContext
} from 'react';
import {
  TUser,
  setTokenHeader,
  useLoginUserMutation,
  useLogoutUserMutation,
  useGetUserQuery,
  useRefreshTokenMutation,
} from '~/data-provider';
import { useNavigate } from 'react-router-dom';
import { hyphaWebsocketClient } from 'imjoy-rpc';

export type TAuthContext = {
  user: TUser | undefined;
  token: string | undefined;
  hypha: any | undefined;
  isAuthenticated: boolean;
  error: string | undefined;
  login: (token: string) => void;
  logout: () => void;
};

export type TUserContext = {
  user?: TUser | undefined;
  token: string | undefined;
  hypha: any | undefined;
  isAuthenticated: boolean;
  redirect?: string;
};

window['errorTimeout'] = undefined;
const AuthContext = createContext<TAuthContext | undefined>(undefined);

const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const [connecting, setConnecting] = useState<boolean>(false);
  const [hypha, setHypha] = useState<any | undefined>(undefined);
  const [user, setUser] = useState<TUser | undefined>(undefined);
  const [token, setToken] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const navigate = useNavigate();

  const loginUser = useLoginUserMutation();
  const logoutUser = useLogoutUserMutation();
  const userQuery = useGetUserQuery({ enabled: !!token });
  const refreshToken = useRefreshTokenMutation();

  // This seems to prevent the error flashing issue
  const doSetError = (error: string | undefined) => {
    if (error) {
      console.log(error);
      // set timeout to ensure we don't get a flash of the error message
      window['errorTimeout'] = setTimeout(() => {
        setError(error);
      }, 400);
    }
  }

  const setUserContext = useCallback(
    (userContext: TUserContext) => {
      const { token, isAuthenticated, user, hypha, redirect } = userContext;
      if (user) {
        setUser(user);
      }
      setToken(token);
      setHypha(hypha);
      //@ts-ignore - ok for token to be undefined initially
      setTokenHeader(token);
      setIsAuthenticated(isAuthenticated);
      // save token to local storage
      if (token) {
        localStorage.setItem('token', token);
        // set the expiry to 12h from now
        localStorage.setItem('tokenExpiry', new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString());
      }

      if (redirect) {
        navigate(redirect);
      }
    },
    [navigate]
  );

  const login = (token: string) => {
    setConnecting(true);
    if(connecting) return;
    hyphaWebsocketClient.connectToServer({ server_url: "https://ai.imjoy.io", token: token }).then((server) => {
      console.log("connected to server", server)
      setUserContext({ token, isAuthenticated: true, redirect: '/chat/new', hypha: server });
      setConnecting(false)
    }).catch((err) => {
      console.error("failed to connect to server", err)
      setConnecting(false)
    })
  };

  const logout = () => {
    // remove token from local storage
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiry');
    setUserContext({
      token: undefined,
      isAuthenticated: false,
      user: undefined,
      hypha: undefined,
      redirect: '/login'
    });
  };

  useEffect(() => {
    if (userQuery.data) {
      setUser(userQuery.data);
    } else if (userQuery.isError) {
      //@ts-ignore - userQuery.error is of type unknown
      doSetError(userQuery?.error.message);
      navigate('/login');
    }
    if (error && isAuthenticated) {
      doSetError(undefined);
    }
    if (!token || !isAuthenticated) {
      // read token from local storage and check the expiry
      const tokenFromLocalStorage = localStorage.getItem('token');
      const tokenFromLocalStorageExpiry = localStorage.getItem('tokenExpiry');
      if (tokenFromLocalStorage && tokenFromLocalStorageExpiry) {
        const tokenExpiry = new Date(tokenFromLocalStorageExpiry);
        if (tokenExpiry > new Date()) {
          login(tokenFromLocalStorage);
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('tokenExpiry');
          navigate('/login');
        }
      }
      else{
        navigate('/login');
      }
    }
  }, [
    token,
    isAuthenticated,
    userQuery.data,
    userQuery.isError,
    userQuery.error,
    error,
    navigate,
    setUserContext
  ]);

  // const silentRefresh = useCallback(() => {
  //   refreshToken.mutate(undefined, {
  //     onSuccess: (data: TLoginResponse) => {
  //       const { user, token } = data;
  //       setUserContext({ token, isAuthenticated: true, user });
  //     },
  //     onError: error => {
  //       setError(error.message);
  //     }
  //   });
  //   
  // }, [setUserContext]);

  // useEffect(() => {
  //   if (token)
  //   silentRefresh();
  // }, [token, silentRefresh]);

  // Make the provider update only when it should
  const memoedValue = useMemo(
    () => ({
      user,
      token,
      hypha,
      isAuthenticated,
      error,
      login,
      logout
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, error, isAuthenticated, token, hypha]
  );

  return <AuthContext.Provider value={memoedValue}>{children}</AuthContext.Provider>;
};

const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuthContext should be used inside AuthProvider');
  }

  return context;
};

export { AuthContextProvider, useAuthContext };
