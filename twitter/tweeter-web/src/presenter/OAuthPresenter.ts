import { Presenter } from "./Presenter";
export interface OAuthView { displayInfo(message: string): void; }
export class OAuthPresenter extends Presenter<OAuthView> {
  select(provider: string) { this.view.displayInfo(`${provider} authentication is not implemented.`); }
}
