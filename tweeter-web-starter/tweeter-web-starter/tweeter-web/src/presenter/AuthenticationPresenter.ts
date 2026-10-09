import { AuthToken, User } from "tweeter-shared";
import { UserService } from "../model/service/UserService";
import { MessageView } from "./Presenter";

export interface AuthenticationView extends MessageView {
  setIsLoading(value: boolean): void;
  authenticated(user: User, token: AuthToken, remember: boolean, path: string): void;
}
export class LoginPresenter {
  private busy = false;
  constructor(private view: AuthenticationView, public service = new UserService()) {}
  isDisabled(alias: string, password: string): boolean { return this.busy || !alias.trim() || !password; }
  async login(alias: string, password: string, remember: boolean, originalUrl?: string) {
    if (this.isDisabled(alias, password)) return;
    this.busy = true;
    this.view.setIsLoading(true);
    try {
      const [user, token] = await this.service.login(alias, password);
      this.view.authenticated(user, token, remember, originalUrl || `/feed/${user.alias}`);
    } catch (error) { this.view.displayError(`Failed to sign in: ${error}`); }
    finally { this.busy = false; this.view.setIsLoading(false); }
  }
}
export interface RegisterView extends AuthenticationView {
  imageSelected(url: string): void;
}
export class RegisterPresenter {
  private busy = false;
  private bytes = new Uint8Array();
  private extension = "";
  private imageVersion = 0;
  constructor(private view: RegisterView, public service = new UserService()) {}
  isDisabled(first: string, last: string, alias: string, password: string): boolean {
    return this.busy || !first.trim() || !last.trim() || !alias.trim() || !password || !this.bytes.length || !this.extension;
  }
  async selectImage(file?: File) {
    const version = ++this.imageVersion;
    this.bytes = new Uint8Array(); this.extension = "";
    this.view.imageSelected("");
    if (!file) return;
    try {
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
    } catch (error) { if (version === this.imageVersion) this.view.displayError(`Failed to load image: ${error}`); }
  }
  async register(first: string, last: string, alias: string, password: string, remember: boolean) {
    if (this.isDisabled(first, last, alias, password)) return;
    this.busy = true; this.view.setIsLoading(true);
    try {
      const [user, token] = await this.service.register(first, last, alias, password, this.bytes, this.extension);
      this.view.authenticated(user, token, remember, `/feed/${user.alias}`);
    } catch (error) { this.view.displayError(`Failed to register: ${error}`); }
    finally { this.busy = false; this.view.setIsLoading(false); }
  }
}
