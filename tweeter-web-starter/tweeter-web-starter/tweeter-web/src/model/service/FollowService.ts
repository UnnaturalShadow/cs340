import { AuthToken, FakeData, User } from "tweeter-shared";

export class FollowService {
  async getFollowers(token: AuthToken, user: User, last: User | null, size: number): Promise<[User[], boolean]> {
    return FakeData.instance.getPageOfUsers(last, size, user.alias);
  }
  async getFollowees(token: AuthToken, user: User, last: User | null, size: number): Promise<[User[], boolean]> {
    // Delegation: getFollowees() reuses getFollowers() while both use dummy data.
    return this.getFollowers(token, user, last, size);
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
  async follow(token: AuthToken, user: User): Promise<[followerCount: number, followeeCount: number]> {
    // TODO: Call the server's follow endpoint before retrieving updated counts.
    return this.simulateFollowChange(token, user);
  }
  async unfollow(token: AuthToken, user: User): Promise<[followerCount: number, followeeCount: number]> {
    // TODO: Call the server's unfollow endpoint before retrieving updated counts.
    return this.simulateFollowChange(token, user);
  }
  // Extract method: follow()/unfollow() reuse simulateFollowChange() for delay and counts.
  private async simulateFollowChange(token: AuthToken, user: User): Promise<[followerCount: number, followeeCount: number]> {
    // Pause so the follow message is visible. Remove when connected to the server.
    await new Promise(resolve => setTimeout(resolve, 2000));
    const followerCount = await this.getFollowerCount(token, user);
    const followeeCount = await this.getFolloweeCount(token, user);
    return [followerCount, followeeCount];
  }
}
