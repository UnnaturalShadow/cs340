import { AuthToken, User } from "tweeter-shared";
import { MessageView } from "./Presenter";

export interface ScrollerView<T> extends MessageView {
  setItems(items: T[]): void;
  setHasMoreItems(value: boolean): void;
}
export abstract class ScrollerPresenter<T> {
  private items: T[] = [];
  private last: T | null = null;
  private more = true;
  private loading = false;
  private generation = 0;
  private token: AuthToken | null = null;
  private user: User | null = null;
  constructor(private view: ScrollerView<T>, private label: string,
    private load: (token: AuthToken, user: User, last: T | null, size: number) => Promise<[T[], boolean]>) {}
  reset(token: AuthToken | null, user: User | null) {
    this.generation++; this.token = token; this.user = user;
    this.items = []; this.last = null; this.more = true; this.loading = false;
    this.view.setItems([]); this.view.setHasMoreItems(true);
    void this.loadMore();
  }
  cancel() { this.generation++; }
  async loadMore() {
    if (this.loading || !this.more || !this.token || !this.user) return;
    const generation = this.generation;
    this.loading = true;
    try {
      const [items, more] = await this.load(this.token, this.user, this.last, 10);
      if (generation !== this.generation) return;
      this.items = [...this.items, ...items]; this.last = items[items.length - 1] ?? this.last;
      this.more = more; this.view.setItems(this.items); this.view.setHasMoreItems(more);
    } catch (error) {
      if (generation === this.generation) {
        this.more = false; this.view.setHasMoreItems(false);
        this.view.displayError(`Failed to load ${this.label}: ${error}`);
      }
    } finally { if (generation === this.generation) this.loading = false; }
  }
}
