# Milestone 2A architecture

The request path is React view or hook → presenter → service → shared domain model/FakeData. Services contain the dummy backend implementation; presenters never import React or concrete views. Each view supplies an observer interface with callbacks for state, navigation, and messages. Requests use async/await between presenters and services.

| View / hook | Presenter | Service requests |
| --- | --- | --- |
| Login | LoginPresenter | Login |
| Register | RegisterPresenter | Register |
| Followers | FollowersPresenter | Get followers |
| Followees | FolloweesPresenter | Get followees |
| Feed | FeedPresenter | Get feed |
| Story | StoryPresenter | Get story |
| UserInfoComponent | UserInfoPresenter | Follower status, follower count, followee count, follow, unfollow |
| PostStatus | PostStatusPresenter | Post status |
| AppNavbar | AppNavbarPresenter | Logout |
| useUserNavigation | UserNavigationPresenter | Get user |
| UserInfoProvider | UserInfoProviderPresenter | Restore, save, and clear remembered session |
| OAuth | OAuthPresenter | Explain unavailable external authentication |

The 14 dummy backend requests are grouped in UserService, FollowService, and StatusService. SessionService preserves the existing optional Remember me behavior. UserInfoProvider owns React context state; display-only components and context hooks do not need presenters.

Presenters own input validation, image conversion, busy guards, status creation, paging cursors, page size, and error/success handling. Scroller and profile presenters discard stale results after the selected user changes. Each scroller has its own React view and presenter. The shared paging implementation avoids duplicating cursor and cancellation handling.

Login and registration return the same dummy user. Follow status is randomized on profile load; follow/unfollow only changes the current button state and does not persist or change counts. Posting succeeds without adding a status to feed or story. No AWS backend calls are made. Mentions open the user's story, and URLs remain clickable.

## Validation

From the project root in Ubuntu WSL:

```sh
npm run build --workspace tweeter-web
npm run test:mvp --workspace tweeter-web
npm start --workspace tweeter-web
```

The focused presenter checks cover dummy authentication, validation, error/loading cleanup, paging request guards, stale result cancellation, unchanged follow counts, posting, logout, user lookup, and remembered sessions. For a visual passoff, also exercise login/register, all four lists and pagination, profile navigation including back/forward, follow/unfollow, posting, and logout in the browser.
