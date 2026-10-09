import { User } from "tweeter-shared";
import { FollowService } from "../model/service/FollowService";
import { ScrollerPresenter, ScrollerView } from "./ScrollerPresenter";

export class FolloweesPresenter extends ScrollerPresenter<User> {
  constructor(view: ScrollerView<User>, service = new FollowService()) { super(view, "followees", service.getFollowees.bind(service)); }
}
