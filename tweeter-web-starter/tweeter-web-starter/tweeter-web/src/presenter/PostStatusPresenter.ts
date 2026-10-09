import { AuthToken, Status, User } from "tweeter-shared";
import { StatusService } from "../model/service/StatusService";
import { RequestView } from "./Presenter";

export interface PostStatusView extends RequestView { setPost(post: string): void; }
export class PostStatusPresenter {
  private busy = false;
  constructor(private view: PostStatusView, public service = new StatusService()) {}
  isDisabled(post: string, token: AuthToken | null, user: User | null) { return this.busy || !post.trim() || !token || !user; }
  async submit(post: string, token: AuthToken | null, user: User | null) {
    if (this.isDisabled(post, token, user)) return;
    this.busy = true; this.view.setIsLoading(true);
    const id = this.view.displayInfo("Posting status...", 0);
    try {
      await this.service.postStatus(token!, new Status(post, user!, Date.now()));
      this.view.setPost(""); this.view.displayInfo("Status posted!", 2000);
    } catch (error) { this.view.displayError(`Failed to post status: ${error}`); }
    finally { this.view.deleteMessage(id); this.busy = false; this.view.setIsLoading(false); }
  }
}
