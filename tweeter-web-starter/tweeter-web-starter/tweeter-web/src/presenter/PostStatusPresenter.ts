import { AuthToken, Status, User } from "tweeter-shared";
import { StatusService } from "../model/service/StatusService";
import { RequestPresenter, RequestView } from "./Presenter";

export interface PostStatusView extends RequestView { setPost(post: string): void; }
export class PostStatusPresenter extends RequestPresenter<PostStatusView> {
  constructor(view: PostStatusView, public service = new StatusService()) { super(view); }
  isDisabled(post: string, token: AuthToken | null, user: User | null) { return this.busy || !post.trim() || !token || !user; }
  async submit(post: string, token: AuthToken | null, user: User | null) {
    if (this.isDisabled(post, token, user)) return;
    await this.doRequest(async () => {
      await this.service.postStatus(token!, new Status(post, user!, Date.now()));
      this.view.setPost(""); this.view.displayInfo("Status posted!", 2000);
    }, "post status", "Posting status...");
  }
}
