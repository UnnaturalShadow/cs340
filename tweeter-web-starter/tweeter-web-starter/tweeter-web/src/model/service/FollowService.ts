import { AuthToken, FakeData, User } from "tweeter-shared";

export class FollowService {
  async getFollowers(token: AuthToken, user: User, last: User | null, size: number): Promise<[User[], boolean]> {
    return FakeData.instance.getPageOfUsers(last, size, user.alias);
  }
  async getFollowees(token: AuthToken, user: User, last: User | null, size: number): Promise<[User[], boolean]> {
    return FakeData.instance.getPageOfUsers(last, size, user.alias);
  }
  async isFollower(token: AuthToken, current: User, selected: User): Promise<boolean> {
    return !current.equals(selected) && FakeData.instance.isFollower();
  }
  async getFollowerCount(token: AuthToken, user: User): Promise<number> {
    return await FakeData.instance.getFollowerCount(user.alias);
  }
  async getFolloweeCount(token: AuthToken, user: User): Promise<number> {
    return await FakeData.instance.getFolloweeCount(user.alias);
  }
  async follow(token: AuthToken, user: User): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  async unfollow(token: AuthToken, user: User): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}
