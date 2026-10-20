import { AuthToken, User } from "tweeter-shared";
import { FollowService } from "../model/service/FollowService";
import { RequestPresenter, RequestView } from "./Presenter";

export interface UserInfoView extends RequestView {
  setIsFollower(value: boolean): void;
  setFollowerCount(value: number): void;
  setFolloweeCount(value: number): void;
}
export class UserInfoPresenter extends RequestPresenter<UserInfoView> {
  private generation = 0;
  constructor(view: UserInfoView, public service = new FollowService()) { super(view); }
  cancel() { this.generation++; }
  async load(token: AuthToken, current: User, selected: User) {
    const generation = ++this.generation;
    this.view.setFollowerCount(-1); this.view.setFolloweeCount(-1); this.view.setIsFollower(false);
    await this.doFailureReportingOperation(async () => {
      const [following, followers, followees] = await Promise.all([
        this.service.isFollower(token, current, selected), this.service.getFollowerCount(token, selected), this.service.getFolloweeCount(token, selected)]);
      if (generation !== this.generation) return;
      this.view.setIsFollower(following); this.view.setFollowerCount(followers); this.view.setFolloweeCount(followees);
    }, "load profile", {
      shouldReport: () => generation === this.generation,
    });
  }
  // Shared follow/unfollow workflow.
  async changeFollow(token: AuthToken, selected: User, follow: boolean) {
    const generation = this.generation;
    await this.doRequest(async () => {
      const [followerCount, followeeCount] = follow
        ? await this.service.follow(token, selected)
        : await this.service.unfollow(token, selected);
      if (generation === this.generation) {
        this.view.setIsFollower(follow);
        this.view.setFollowerCount(followerCount);
        this.view.setFolloweeCount(followeeCount);
      }
    }, `${follow ? "follow" : "unfollow"} user`, `${follow ? "Following" : "Unfollowing"} ${selected.name}...`);
  }
}
