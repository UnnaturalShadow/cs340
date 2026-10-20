import { AuthToken, Status, User } from "tweeter-shared";
import { PagedStatusItemPresenter } from "./PagedStatusItemPresenter";

export class StoryPresenter extends PagedStatusItemPresenter {
  protected getMoreItems(token: AuthToken, user: User): Promise<[Status[], boolean]> {
    return this.service.getStory(token, user, this.lastItem, this.pageSize);
  }

  protected getItemDescription(): string { return "story"; }
}
