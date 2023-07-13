import { useEffect, useState } from 'react';
import { useAuthContext } from '~/hooks/AuthContext';
import { useNavigate } from 'react-router-dom';
import { hyphaWebsocketClient } from 'imjoy-rpc';
import Spinner from '../svg/Spinner';

function Login() {
  const { login, error, isAuthenticated } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/chat/new');
    }
  }, [isAuthenticated, navigate]);
  async function handleSubmit() {
    setLoading(true);
    try{
      const token = await hyphaWebsocketClient.login({
        server_url: "https://ai.imjoy.io", login_callback(context) {
          window.open(context.login_url, "_blank")
          console.log("login callback", context)
        }
      })
      login(token);
    }
    catch(e){
      console.error(e)
      alert("Failed to login: " + e.message);
    }
    finally{
      setTimeout(() => {setLoading(false);}, 1000);
    }    
  }
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white pt-6 sm:pt-0">
      <div className="mt-6 w-96 overflow-hidden bg-white px-6 py-4 sm:max-w-md sm:rounded-lg">
        <h1 className="mb-4 text-center text-3xl font-semibold">Welcome back</h1>
        <div
          className="mt-6"
          aria-label="Login form"
        >
          <div className="mt-6">
            <button
              disabled={loading}
              onClick={handleSubmit}
              aria-label="Sign in"
              className="w-full transform rounded-sm bg-green-500 px-4 py-3 tracking-wide text-white transition-colors duration-200 hover:bg-green-600 focus:bg-green-600 focus:outline-none"
            >
              {loading && <Spinner classProp="ml-1" /> || "Login / Sign Up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
