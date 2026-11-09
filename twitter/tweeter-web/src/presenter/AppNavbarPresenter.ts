import { AuthToken } from "tweeter-shared";
import { UserService } from "../model/service/UserService";
import { RequestPresenter, RequestView } from "./Presenter";

export interface NavbarView extends RequestView {
  clearUserInfo(): void;
  navigateToLogin(): void;
}
export class AppNavbarPresenter extends RequestPresenter<NavbarView> {
  constructor(view: NavbarView, private _service = new UserService()) { super(view); }
  public get service(): UserService { return this._service; }
  async logout(token: AuthToken) {
    await this.doRequest(async () => {
      await this.service.logout(token);
      this.view.clearUserInfo();
      this.view.navigateToLogin();
    }, "log out", "Logging out...", false);
  }
}
