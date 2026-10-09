
export interface OAuthView { displayInfo(message: string): void; }
export class OAuthPresenter {
  constructor(private view: OAuthView) {}
  select(provider: string) { this.view.displayInfo(`${provider} authentication is not implemented.`); }
}
