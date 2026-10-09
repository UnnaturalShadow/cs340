import { AuthToken, FakeData, Status, User } from "tweeter-shared";

export class StatusService {
  async getFeed(token: AuthToken, user: User, last: Status | null, size: number): Promise<[Status[], boolean]> {
    return FakeData.instance.getPageOfStatuses(last, size);
  }
  async getStory(token: AuthToken, user: User, last: Status | null, size: number): Promise<[Status[], boolean]> {
    return FakeData.instance.getPageOfStatuses(last, size);
  }
  async postStatus(token: AuthToken, status: Status): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}
