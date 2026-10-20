import { AuthToken } from "tweeter-shared";
import { UserService } from "../model/service/UserService";
import { RequestPresenter, RequestView } from "./Presenter";

export interface NavbarView extends RequestView { loggedOut(): void; }
export class AppNavbarPresenter extends RequestPresenter<NavbarView> {
  constructor(view: NavbarView, public service = new UserService()) { super(view); }
  async logout(token: AuthToken) {
    await this.doRequest(async () => {
      await this.service.logout(token);
      this.view.loggedOut();
    }, "log out", "Logging out...");
  }
}
