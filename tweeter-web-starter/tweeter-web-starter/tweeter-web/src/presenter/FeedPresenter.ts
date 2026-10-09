import { Status } from "tweeter-shared";
import { StatusService } from "../model/service/StatusService";
import { ScrollerPresenter, ScrollerView } from "./ScrollerPresenter";

export class FeedPresenter extends ScrollerPresenter<Status> {
  constructor(view: ScrollerView<Status>, service = new StatusService()) { super(view, "feed", service.getFeed.bind(service)); }
}
