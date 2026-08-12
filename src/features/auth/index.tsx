import { useLogin } from './hook/useLogin';
import { LoginView } from './ui/LoginView';

/** Auth login container — wires stub sign-in into dumb UI. */
export function Login() {
  const login = useLogin();
  return <LoginView {...login} />;
}

export default Login;
