import { AuthToken, User } from "tweeter-shared";
import { Session, SessionService } from "../model/service/SessionService";
import { Presenter } from "./Presenter";
export interface UserInfoProviderView { setSession(session: Session): void; }
export class UserInfoProviderPresenter extends Presenter<UserInfoProviderView> {
  constructor(view: UserInfoProviderView, private service: SessionService) { super(view); }
  restore() { return this.service.restore(); }
  update(currentUser: User, displayedUser: User | null, authToken: AuthToken, remember: boolean) {
    this.service.save(currentUser, authToken, remember);
    this.view.setSession({ currentUser, displayedUser, authToken });
  }
  clear() {
    this.service.clear(); this.view.setSession({ currentUser: null, displayedUser: null, authToken: null });
  }
}
