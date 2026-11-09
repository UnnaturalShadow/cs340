import { AuthToken, User } from "tweeter-shared";
import { PagedUserItemPresenter } from "./PagedUserItemPresenter";

export class FolloweesPresenter extends PagedUserItemPresenter {
  protected getMoreItems(token: AuthToken, user: User): Promise<[User[], boolean]> {
    return this.service.getFollowees(token, user, this.lastItem, this.pageSize);
  }

  protected getItemDescription(): string { return "followees"; }
}
