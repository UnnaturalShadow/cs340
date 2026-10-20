import { AuthenticationPresenter, AuthenticationView } from "./AuthenticationPresenter";

export interface LoginView extends AuthenticationView {}
export class LoginPresenter extends AuthenticationPresenter<LoginView> {
  isDisabled(alias: string, password: string): boolean { return this.credentialsMissing(alias, password); }
  async login(alias: string, password: string, remember: boolean, originalUrl?: string) {
    if (this.isDisabled(alias, password)) return;
    await this.authenticate(() => this.service.login(alias, password), remember, "sign in", originalUrl);
  }
}
