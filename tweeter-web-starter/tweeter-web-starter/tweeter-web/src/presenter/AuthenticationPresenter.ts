import { AuthToken, User } from "tweeter-shared";
import { UserService } from "../model/service/UserService";
import { BusyPresenter, MessageView } from "./Presenter";

export interface AuthenticationView extends MessageView {
  setIsLoading(value: boolean): void;
  authenticated(user: User, token: AuthToken, remember: boolean, path: string): void;
}

export abstract class AuthenticationPresenter<V extends AuthenticationView> extends BusyPresenter<V> {
  constructor(view: V, public service = new UserService()) { super(view); }

  // Extract method: login/register isDisabled() reuse credentialsMissing()
  protected credentialsMissing(alias: string, password: string): boolean {
    return this.busy || !alias.trim() || !password;
  }

  // Function parameter: login/register supply operation(), doBusyOperation() wraps authentication
  protected async authenticate(
    operation: () => Promise<[User, AuthToken]>, remember: boolean, description: string, originalUrl?: string,
  ): Promise<void> {
    await this.doBusyOperation(async () => {
      const [user, token] = await operation();
      this.view.authenticated(user, token, remember, originalUrl || `/feed/${user.alias}`);
    }, description);
  }

  //since login and register are simmilar in their error handling and authentication, even if the logic and steps change.
  //by passing just the logic and steps in as a function parameter, we can reuse the same error handling and authentication 
  // logic
}
