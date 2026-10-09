import { AuthToken, Status, User } from "tweeter-shared";
import { UserService } from "../model/service/UserService";
import { FollowService } from "../model/service/FollowService";
import { StatusService } from "../model/service/StatusService";
import { MessageView, RequestView } from "./Presenter";

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
export interface PostStatusView extends RequestView { setPost(post: string): void; }
export class PostStatusPresenter {
  private busy = false;
  constructor(private view: PostStatusView, public service = new StatusService()) {}
  isDisabled(post: string, token: AuthToken | null, user: User | null) { return this.busy || !post.trim() || !token || !user; }
  async submit(post: string, token: AuthToken | null, user: User | null) {
    if (this.isDisabled(post, token, user)) return;
    this.busy = true; this.view.setIsLoading(true);
    const id = this.view.displayInfo("Posting status...", 0);
    try {
      await this.service.postStatus(token!, new Status(post, user!, Date.now()));
      this.view.setPost(""); this.view.displayInfo("Status posted!", 2000);
    } catch (error) { this.view.displayError(`Failed to post status: ${error}`); }
    finally { this.view.deleteMessage(id); this.busy = false; this.view.setIsLoading(false); }
  }
}
export interface UserInfoView extends RequestView {
  setIsFollower(value: boolean): void;
  setFollowerCount(value: number): void;
  setFolloweeCount(value: number): void;
}
export class UserInfoPresenter {
  private generation = 0;
  private busy = false;
  constructor(private view: UserInfoView, public service = new FollowService()) {}
  cancel() { this.generation++; }
  async load(token: AuthToken, current: User, selected: User) {
    const generation = ++this.generation;
    this.view.setFollowerCount(-1); this.view.setFolloweeCount(-1); this.view.setIsFollower(false);
    try {
      const [following, followers, followees] = await Promise.all([
        this.service.isFollower(token, current, selected), this.service.getFollowerCount(token, selected), this.service.getFolloweeCount(token, selected)]);
      if (generation !== this.generation) return;
      this.view.setIsFollower(following); this.view.setFollowerCount(followers); this.view.setFolloweeCount(followees);
    } catch (error) { if (generation === this.generation) this.view.displayError(`Failed to load profile: ${error}`); }
  }
  async changeFollow(token: AuthToken, selected: User, follow: boolean) {
    if (this.busy) return;
    this.busy = true; this.view.setIsLoading(true);
    const generation = this.generation;
    const id = this.view.displayInfo(`${follow ? "Following" : "Unfollowing"} ${selected.name}...`, 0);
    try {
      if (follow) await this.service.follow(token, selected); else await this.service.unfollow(token, selected);
      if (generation === this.generation) this.view.setIsFollower(follow);
    } catch (error) { this.view.displayError(`Failed to ${follow ? "follow" : "unfollow"} user: ${error}`); }
    finally { this.view.deleteMessage(id); this.busy = false; this.view.setIsLoading(false); }
  }
}
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
export interface OAuthView { displayInfo(message: string): void; }
export class OAuthPresenter {
  constructor(private view: OAuthView) {}
  select(provider: string) { this.view.displayInfo(`${provider} authentication is not implemented.`); }
}
