import { AuthenticationPresenter, AuthenticationView } from "./AuthenticationPresenter";

export interface RegisterView extends AuthenticationView {
  imageSelected(url: string): void;
}
export class RegisterPresenter extends AuthenticationPresenter<RegisterView> {
  private bytes = new Uint8Array();
  private extension = "";
  private imageVersion = 0;
  isDisabled(first: string, last: string, alias: string, password: string): boolean {
    return this.credentialsMissing(alias, password) || !first.trim() || !last.trim() || !this.bytes.length || !this.extension;
  }
  async selectImage(file?: File) {
    const version = ++this.imageVersion;
    this.bytes = new Uint8Array(); this.extension = "";
    this.view.imageSelected("");
    if (!file) return;
    await this.doFailureReportingOperation(async () => {
      if (!file.type.startsWith("image/")) throw new Error("Please select an image file");
      const bytes = new Uint8Array(await file.arrayBuffer());
      const url = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Unable to read image"));
        reader.readAsDataURL(file);
      });
      if (version !== this.imageVersion) return;
      this.bytes = bytes; this.extension = file.name.split(".").pop() || "";
      this.view.imageSelected(url);
    }, "load image", {
      shouldReport: () => version === this.imageVersion,
    });
  }
  async register(first: string, last: string, alias: string, password: string, remember: boolean) {
    if (this.isDisabled(first, last, alias, password)) return;
    await this.authenticate(
      () => this.service.register(first, last, alias, password, this.bytes, this.extension), remember, "register",
    );
  }
}
