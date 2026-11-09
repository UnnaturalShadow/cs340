import { MouseEvent, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { User } from "tweeter-shared";
import { UserNavigationPresenter } from "../presenter/UserNavigationPresenter";
import { ToastType } from "../components/toaster/Toast";
import useMessageActions from "./useMessageActions";
import useUserInfo from "./useUserInfo";
import useUserInfoActions from "./useUserInfoActions";

export default function useUserNavigation(syncRoute = false) {
  const { authToken, displayedUser } = useUserInfo();
  const { setDisplayedUser } = useUserInfoActions();
  const { displayToast } = useMessageActions();
  const navigate = useNavigate();
  const location = useLocation();
  const { displayedUser: aliasParam } = useParams();
  const [presenter] = useState(() => new UserNavigationPresenter({
    setDisplayedUser, navigate,
    displayError: message => { displayToast(ToastType.Error, message, 0); },
  }));
  useEffect(() => {
    if (syncRoute && authToken && aliasParam && aliasParam !== displayedUser?.alias) {
      void presenter.select(authToken, aliasParam);
    }
    return () => presenter.cancel();
  }, [presenter, syncRoute, authToken, aliasParam, displayedUser?.alias]);
  const navigateToUser = (event: MouseEvent<HTMLAnchorElement>, knownUser?: User) => {
    event.preventDefault();
    if (authToken) void presenter.navigateTo(authToken, location.pathname, event.currentTarget.href, knownUser);
  };
  return { navigateToUser };
}
