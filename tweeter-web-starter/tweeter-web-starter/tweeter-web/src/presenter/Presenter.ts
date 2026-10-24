// Shared interface: error-reporting views implement displayError().
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

// Inheritance + generics: Presenter<V> stores each subclass's typed view once.
export abstract class Presenter<V> {
  constructor(protected readonly view: V) {}
}

export abstract class ErrorReportingPresenter<V extends MessageView> extends Presenter<V> {
  // Function parameter: run operation() inside one shared try/catch.
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

// Inheritance: authentication and request presenters reuse doBusyOperation().
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
  // Function parameter: wrap operation() with a progress toast and finally cleanup.
  protected async doRequest(operation: () => Promise<void>, description: string, message: string): Promise<void> {
    await this.doBusyOperation(async () => {
      const id = this.view.displayInfo(message, 0);
      try { await operation(); }
      finally { this.view.deleteMessage(id); }
    }, description);
  }
}
