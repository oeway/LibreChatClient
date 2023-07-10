import {
  useState,
  useEffect,
  useMemo,
  ReactNode,
  useCallback,
  createContext,
  useContext
} from 'react';
import { hyphaWebsocketClient } from 'imjoy-rpc';
import {
  TUser,
  TLoginResponse,
  setTokenHeader,
  useLoginUserMutation,
  useLogoutUserMutation,
  useGetUserQuery,
  useRefreshTokenMutation,
  TLoginUser
} from '~/data-provider';
import { useNavigate } from 'react-router-dom';

export type TAuthContext = {
  user: TUser | undefined;
  token: string | undefined;
  hypha: any | undefined;
  isAuthenticated: boolean;
  error: string | undefined;
  login: (data: TLoginUser) => void;
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
      if (redirect) {
        navigate(redirect);
      }
    },
    [navigate]
  );

  const getCookieValue = (key) => {
    let keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
    return keyValue ? keyValue[2] : null;
  };

  const login = (data: TLoginUser) => {
    loginUser.mutate(data, {
      onSuccess: (data: TLoginResponse) => {
        const { user, token } = data;
        setUserContext({ token, isAuthenticated: true, user, redirect: '/chat/new', hypha: undefined });
      },
      onError: (error) => {
        doSetError(error.message);
      }
    });
  };

  const logout = () => {
    document.cookie.split(';').forEach((c) => {
      document.cookie = c
        .replace(/^ +/, '')
        .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
    });
    logoutUser.mutate(undefined, {
      onSuccess: () => {
        setUserContext({
          token: undefined,
          isAuthenticated: false,
          user: undefined,
          hypha: undefined,
          redirect: '/login'
        });
      },
      onError: (error) => {
        doSetError(error.message);
      }
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
      const tokenFromCookie = getCookieValue('token');
      if (tokenFromCookie) {
        setUserContext({ token: tokenFromCookie, isAuthenticated: true, user: userQuery.data, hypha: undefined });
      } else {
        // navigate('/login');
        hyphaWebsocketClient.login({server_url: "https://ai.imjoy.io", login_callback(context){
          window.open(context.login_url, "_blank")
          console.log("login callback", context)
        }}).then((token) => {
          hyphaWebsocketClient.connectToServer({server_url: "https://ai.imjoy.io", token: token}).then((server) => {
            console.log("connected to server", server)  
            setUserContext({ token, isAuthenticated: true, user: userQuery.data, hypha: server });
          });
        }).catch((err) => {
          console.error(err)
        })
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
