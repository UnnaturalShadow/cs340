import { AuthToken, User } from "tweeter-shared";
import { UserService } from "../model/service/UserService";
import { BusyPresenter, MessageView } from "./Presenter";

export interface AuthenticationView extends MessageView {
  setIsLoading(value: boolean): void;
  authenticated(user: User, token: AuthToken, remember: boolean, path: string): void;
}

export abstract class AuthenticationPresenter<V extends AuthenticationView> extends BusyPresenter<V> {
  constructor(view: V, public service = new UserService()) { super(view); }

  // Shared login/register validation.
  protected credentialsMissing(alias: string, password: string): boolean {
    return this.busy || !alias.trim() || !password;
  }

  // Shared login/register workflow.
  protected async authenticate(
    operation: () => Promise<[User, AuthToken]>, remember: boolean, description: string, originalUrl?: string,
  ): Promise<void> {
    await this.doBusyOperation(async () => {
      const [user, token] = await operation();
      this.view.authenticated(user, token, remember, originalUrl || `/feed/${user.alias}`);
    }, description);
  }
}
