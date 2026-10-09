import { useCallback, useMemo, useState } from "react";
import { User, AuthToken } from "tweeter-shared";
import { UserInfoContext, UserInfoActionsContext } from "./UserInfoContexts";
import { Session, SessionService } from "../../model/service/SessionService";
import { UserInfoProviderPresenter } from "../../presenter/UserInfoProviderPresenter";

const UserInfoProvider = ({ children }: { children: React.ReactNode }) => {
  const [service] = useState(() => new SessionService(localStorage));
  const [presenter] = useState<UserInfoProviderPresenter>(() => new UserInfoProviderPresenter({ setSession: session => setUserInfo(session) }, service));
  const [userInfo, setUserInfo] = useState<Session>(() => presenter.restore());
  const updateUserInfo = useCallback((current: User, displayed: User | null, token: AuthToken, remember = false) => {
    presenter.update(current, displayed, token, remember);
  }, [presenter]);
  const clearUserInfo = useCallback(() => presenter.clear(), [presenter]);
  const setDisplayedUser = useCallback((user: User) => setUserInfo(previous => ({ ...previous, displayedUser: user })), []);
  const actions = useMemo(() => ({ updateUserInfo, clearUserInfo, setDisplayedUser }), [updateUserInfo, clearUserInfo, setDisplayedUser]);
  return <UserInfoContext.Provider value={userInfo}>
    <UserInfoActionsContext.Provider value={actions}>{children}</UserInfoActionsContext.Provider>
  </UserInfoContext.Provider>;
};
export default UserInfoProvider;
