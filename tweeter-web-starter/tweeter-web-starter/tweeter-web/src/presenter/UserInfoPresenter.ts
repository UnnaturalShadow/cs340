import { AuthToken, User } from "tweeter-shared";
import { FollowService } from "../model/service/FollowService";
import { RequestView } from "./Presenter";

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
