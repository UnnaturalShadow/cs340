import { AuthToken } from "tweeter-shared";
import { UserService } from "../model/service/UserService";
import { RequestView } from "./Presenter";

export interface NavbarView extends RequestView { loggedOut(): void; }
export class AppNavbarPresenter {
  private busy = false;
  constructor(private view: NavbarView, public service = new UserService()) {}
  async logout(token: AuthToken) {
    if (this.busy) return;
    this.busy = true;
    const id = this.view.displayInfo("Logging out...", 0);
    try { await this.service.logout(token); this.view.loggedOut(); }
    catch (error) { this.view.displayError(`Failed to log out: ${error}`); }
    finally { this.view.deleteMessage(id); this.busy = false; }
  }
}
