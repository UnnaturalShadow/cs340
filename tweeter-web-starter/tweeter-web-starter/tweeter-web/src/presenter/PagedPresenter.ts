import { AuthToken, User } from "tweeter-shared";
import { ErrorReportingPresenter, MessageView } from "./Presenter";

export interface PagedPresenterView<T> extends MessageView {
  setItems(items: T[]): void;
  setHasMoreItems(value: boolean): void;
}
// Shared paging state for all four lists.
export abstract class PagedPresenter<T, U> extends ErrorReportingPresenter<PagedPresenterView<T>> {
  private items: T[] = [];
  private last: T | null = null;
  private more = true;
  private loading = false;
  private generation = 0;
  private _service: U | undefined;
  protected readonly pageSize = 10;

  constructor(view: PagedPresenterView<T>, service?: U) {
    super(view);
    this._service = service;
  }

  public get service(): U { return this._service ??= this.createService(); }
  protected get lastItem(): T | null { return this.last; }
  protected abstract createService(): U;
  protected abstract getMoreItems(token: AuthToken, user: User): Promise<[T[], boolean]>;
  protected abstract getItemDescription(): string;

  reset(token: AuthToken | null, user: User | null) {
    this.generation++;
    this.items = []; this.last = null; this.more = true; this.loading = false;
    this.view.setItems([]); this.view.setHasMoreItems(true);
    if (token && user) void this.loadMoreItems(token, user);
  }
  cancel() { this.generation++; }
  // Template method: shared paging steps.
  async loadMoreItems(token: AuthToken, user: User) {
    if (this.loading || !this.more) return;
    const generation = this.generation;
    this.loading = true;
    try {
      await this.doFailureReportingOperation(async () => {
        const [items, more] = await this.getMoreItems(token, user);
        if (generation !== this.generation) return;
        this.items = [...this.items, ...items]; this.last = items[items.length - 1] ?? this.last;
        this.more = more; this.view.setItems(this.items); this.view.setHasMoreItems(more);
      }, `load ${this.getItemDescription()}`, {
        shouldReport: () => generation === this.generation,
        onFailure: () => {
          this.more = false; this.view.setHasMoreItems(false);
        },
      });
    } finally { if (generation === this.generation) this.loading = false; }
  }
}
