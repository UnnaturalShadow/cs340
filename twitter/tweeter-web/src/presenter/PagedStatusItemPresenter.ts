import { Status } from "tweeter-shared";
import { StatusService } from "../model/service/StatusService";
import { PagedPresenter } from "./PagedPresenter";

export abstract class PagedStatusItemPresenter extends PagedPresenter<Status, StatusService> {
  // Inheritance: createService() supplies StatusService for feed and story.
  protected createService(): StatusService { return new StatusService(); }
}
