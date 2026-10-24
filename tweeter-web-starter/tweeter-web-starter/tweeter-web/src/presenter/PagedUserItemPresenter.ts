import { User } from "tweeter-shared";
import { FollowService } from "../model/service/FollowService";
import { PagedPresenter } from "./PagedPresenter";

export abstract class PagedUserItemPresenter extends PagedPresenter<User, FollowService> {
  // Inheritance: createService() supplies FollowService for followers and followees.
  protected createService(): FollowService { return new FollowService(); }
}
