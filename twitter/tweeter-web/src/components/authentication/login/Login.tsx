import { LoginPresenter, LoginView } from "../../../presenter/LoginPresenter";
import AuthenticationFields from "../AuthenticationFields";
import useAuthenticationView from "../../../hooks/useAuthenticationView";
import "./Login.css";
import "bootstrap/dist/css/bootstrap.css";

import { useState } from "react";
import { Link } from "react-router-dom";
import AuthenticationFormLayout from "../AuthenticationFormLayout";

interface Props {
  originalUrl?: string;
  presenterFactory?: (view: LoginView) => LoginPresenter;
}

const Login = (props: Props) => {
  const [alias, setAlias] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const { isLoading, view } = useAuthenticationView();

  const [presenter] = useState(() => props.presenterFactory?.(view) ?? new LoginPresenter(view));
  const checkSubmitButtonStatus = () => isLoading || presenter.isDisabled(alias, password);
  const loginOnEnter = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter") { event.preventDefault(); void doLogin(); }
  };
  const doLogin = () => presenter.login(alias, password, rememberMe, props.originalUrl);

  const inputFieldFactory = () => {
    return (
      <>
        <AuthenticationFields setAlias={setAlias} setPassword={setPassword} onKeyDown={loginOnEnter} passwordIsLast />
      </>
    );
  };

  const switchAuthenticationMethodFactory = () => {
    return (
      <div className="mb-3">
        Not registered? <Link to="/register">Register</Link>
      </div>
    );
  };

  return (
    <AuthenticationFormLayout
      headingText="Please Sign In"
      submitButtonLabel="Sign in"
      oAuthHeading="Sign in with:"
      inputFieldFactory={inputFieldFactory}
      switchAuthenticationMethodFactory={switchAuthenticationMethodFactory}
      setRememberMe={setRememberMe}
      submitButtonDisabled={checkSubmitButtonStatus}
      isLoading={isLoading}
      submit={doLogin}
    />
  );
};

export default Login;
