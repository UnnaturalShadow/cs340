import { User } from "tweeter-shared";
import { FollowService } from "../model/service/FollowService";
import { ScrollerPresenter, ScrollerView } from "./ScrollerPresenter";

export class FollowersPresenter extends ScrollerPresenter<User> {
  constructor(view: ScrollerView<User>, service = new FollowService()) { super(view, "followers", service.getFollowers.bind(service)); }
}
