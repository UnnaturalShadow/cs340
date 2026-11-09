import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthenticationView } from "../presenter/AuthenticationPresenter";
import useMessageActions from "./useMessageActions";
import useUserInfoActions from "./useUserInfoActions";
import { ToastType } from "../components/toaster/Toast";

// Custom hook: login/register reuse loading, authenticated(), and displayError() callbacks.
export default function useAuthenticationView() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { updateUserInfo } = useUserInfoActions();
  const { displayToast } = useMessageActions();
  const view: AuthenticationView = {
    setIsLoading,
    displayError: message => { displayToast(ToastType.Error, message, 0); },
    authenticated: (user, token, remember, path) => {
      updateUserInfo(user, user, token, remember);
      navigate(path);
    },
  };
  return { isLoading, view };
}
