import { AuthToken, User } from "tweeter-shared";
export interface Session { currentUser: User | null; displayedUser: User | null; authToken: AuthToken | null; }
export class SessionService {
  constructor(private storage: Storage) {}
  restore(): Session {
    try {
      const user = User.fromJson(this.storage.getItem("CurrentUserKey"));
      const token = AuthToken.fromJson(this.storage.getItem("AuthTokenKey"));
      if (user && token) return { currentUser: user, displayedUser: user, authToken: token };
    } catch { this.clear(); }
    return { currentUser: null, displayedUser: null, authToken: null };
  }
  save(user: User, token: AuthToken, remember: boolean) {
    if (!remember) { this.clear(); return; }
    this.storage.setItem("CurrentUserKey", user.toJson()); this.storage.setItem("AuthTokenKey", token.toJson());
  }
  clear() { this.storage.removeItem("CurrentUserKey"); this.storage.removeItem("AuthTokenKey"); }
}
