import { AuthToken, FakeData, User } from "tweeter-shared";

export class UserService {
  async login(alias: string, password: string): Promise<[User, AuthToken]> {
    const user = FakeData.instance.firstUser;
    if (!user) throw new Error("No dummy user is available");
    return [user, FakeData.instance.authToken];
  }
  async register(first: string, last: string, alias: string, password: string, image: Uint8Array, extension: string): Promise<[User, AuthToken]> {
    return this.login(alias, password);
  }
  async getUser(token: AuthToken, alias: string): Promise<User> {
    const user = FakeData.instance.findUserByAlias(alias);
    if (!user) throw new Error(`User ${alias} was not found`);
    return user;
  }
  async logout(token: AuthToken): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}
