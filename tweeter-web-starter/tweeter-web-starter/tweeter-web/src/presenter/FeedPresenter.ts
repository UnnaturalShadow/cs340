import { AuthToken, Status, User } from "tweeter-shared";
import { PagedStatusItemPresenter } from "./PagedStatusItemPresenter";

export class FeedPresenter extends PagedStatusItemPresenter {
  protected getMoreItems(token: AuthToken, user: User): Promise<[Status[], boolean]> {
    return this.service.getFeed(token, user, this.lastItem, this.pageSize);
  }

  protected getItemDescription(): string { return "feed"; }
}
