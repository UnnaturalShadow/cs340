export interface MessageView {
  displayError(message: string): void;
}
export interface RequestView extends MessageView {
  setIsLoading(loading: boolean): void;
  displayInfo(message: string, duration: number): string;
  deleteMessage(id: string): void;
}
