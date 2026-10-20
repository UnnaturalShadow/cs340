export interface MessageView {
  displayError(message: string): void;
}
export interface RequestView extends MessageView {
  setIsLoading(loading: boolean): void;
  displayInfo(message: string, duration: number): string;
  deleteMessage(id: string): void;
}

interface FailureOptions {
  shouldReport?: () => boolean;
  onFailure?: () => void;
}

/** Owns the view once. V preserves each presenter's specific view contract. */
export abstract class Presenter<V> {
  constructor(protected readonly view: V) {}
}

export abstract class ErrorReportingPresenter<V extends MessageView> extends Presenter<V> {
  protected async doFailureReportingOperation(
    operation: () => Promise<void>,
    description: string,
    options: FailureOptions = {},
  ): Promise<void> {
    try { await operation(); }
    catch (error) {
      if (options.shouldReport && !options.shouldReport()) return;
      options.onFailure?.();
      this.view.displayError(`Failed to ${description}: ${error}`);
    }
  }
}

/** Shared lifecycle: guard, prepare, run with error reporting, and always clean up. */
export abstract class BusyPresenter<V extends MessageView & { setIsLoading(value: boolean): void }>
  extends ErrorReportingPresenter<V> {
  protected busy = false;

  protected async doBusyOperation(operation: () => Promise<void>, description: string): Promise<void> {
    if (this.busy) return;
    this.busy = true;
    try {
      this.view.setIsLoading(true);
      await this.doFailureReportingOperation(operation, description);
    } finally {
      this.busy = false;
      this.view.setIsLoading(false);
    }
  }
}

export abstract class RequestPresenter<V extends RequestView> extends BusyPresenter<V> {
  protected async doRequest(operation: () => Promise<void>, description: string, message: string): Promise<void> {
    await this.doBusyOperation(async () => {
      const id = this.view.displayInfo(message, 0);
      try { await operation(); }
      finally { this.view.deleteMessage(id); }
    }, description);
  }
}
