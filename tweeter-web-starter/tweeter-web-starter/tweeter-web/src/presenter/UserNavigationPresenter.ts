import { AuthToken, User } from "tweeter-shared";
import { UserService } from "../model/service/UserService";
import { MessageView } from "./Presenter";

export interface NavigationView extends MessageView { setDisplayedUser(user: User): void; navigate(path: string): void; }
export class UserNavigationPresenter {
  private generation = 0;
  constructor(private view: NavigationView, public service = new UserService()) {}
  cancel() { this.generation++; }
  async select(token: AuthToken, alias: string, path?: string, knownUser?: User) {
    const generation = ++this.generation;
    try {
      const user = knownUser ?? await this.service.getUser(token, decodeURIComponent(alias));
      if (generation !== this.generation) return;
      this.view.setDisplayedUser(user); if (path) this.view.navigate(path);
    } catch (error) { if (generation === this.generation) this.view.displayError(`Failed to get user: ${error}`); }
  }
  async navigateTo(token: AuthToken, currentPath: string, href: string, knownUser?: User) {
    const path = knownUser ? `${currentPath.split("/@")[0]}/${knownUser.alias}` : new URL(href).pathname;
    await this.select(token, path.substring(path.lastIndexOf("/") + 1), path, knownUser);
  }
}
