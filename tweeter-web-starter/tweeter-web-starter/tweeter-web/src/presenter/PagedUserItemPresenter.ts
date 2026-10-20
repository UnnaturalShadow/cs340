import { User } from "tweeter-shared";
import { FollowService } from "../model/service/FollowService";
import { PagedPresenter } from "./PagedPresenter";

export abstract class PagedUserItemPresenter extends PagedPresenter<User, FollowService> {
  // Shared followers/followees service creation.
  protected createService(): FollowService { return new FollowService(); }
}
