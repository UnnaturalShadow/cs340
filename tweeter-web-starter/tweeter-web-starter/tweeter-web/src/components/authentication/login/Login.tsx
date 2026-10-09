import { LoginPresenter } from "../../../presenter/LoginPresenter";
import AuthenticationFields from "../AuthenticationFields";
import useUserInfoActions from "../../../hooks/useUserInfoActions";
import useMessageActions from "../../../hooks/useMessageActions";
import "./Login.css";
import "bootstrap/dist/css/bootstrap.css";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthenticationFormLayout from "../AuthenticationFormLayout";

import { ToastType } from "../../toaster/Toast";

interface Props {
  originalUrl?: string;
}

const Login = (props: Props) => {
  const [alias, setAlias] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { updateUserInfo } = useUserInfoActions();
  const { displayToast } = useMessageActions();


  const [presenter] = useState(() => new LoginPresenter({
    setIsLoading,
    displayError: message => { displayToast(ToastType.Error, message, 0); },
    authenticated: (user, token, remember, path) => {
      updateUserInfo(user, user, token, remember); navigate(path);
    },
    
  }));
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
