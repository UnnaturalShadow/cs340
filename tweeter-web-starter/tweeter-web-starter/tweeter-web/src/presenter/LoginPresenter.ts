import { AuthToken, User } from "tweeter-shared";
import { UserService } from "../model/service/UserService";
import { MessageView } from "./Presenter";

export interface LoginView extends MessageView {
  setIsLoading(value: boolean): void;
  authenticated(user: User, token: AuthToken, remember: boolean, path: string): void;
}
export class LoginPresenter {
  private busy = false;
  constructor(private view: LoginView, public service = new UserService()) {}
  isDisabled(alias: string, password: string): boolean { return this.busy || !alias.trim() || !password; }
  async login(alias: string, password: string, remember: boolean, originalUrl?: string) {
    if (this.isDisabled(alias, password)) return;
    this.busy = true;
    this.view.setIsLoading(true);
    try {
      const [user, token] = await this.service.login(alias, password);
      this.view.authenticated(user, token, remember, originalUrl || `/feed/${user.alias}`);
    } catch (error) { this.view.displayError(`Failed to sign in: ${error}`); }
    finally { this.busy = false; this.view.setIsLoading(false); }
  }
}
