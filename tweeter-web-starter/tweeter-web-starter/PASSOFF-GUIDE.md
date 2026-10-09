# Milestone 2A passoff cheat sheet

## What to say about the architecture

"React components and hooks receive input and render output. Presenters handle nonvisual UI logic and call services. Services supply dummy backend data using the shared domain model. Presenters update the UI through view interfaces, so they do not depend on concrete React components."

The request flow is **View -> Presenter -> Service -> shared domain/FakeData**. Results return through `async/await`; presenters notify their views through observer callbacks.

## Best example to walk through

Use **Followees** to explain the complete request path:

1. [Followees.tsx](tweeter-web/src/components/mainLayout/Followees.tsx) creates a presenter and supplies the `setItems`, `setHasMoreItems`, and `displayError` callbacks. Its effect calls `reset`; scrolling calls `loadMore`.
2. [ScrollerPresenter.ts](tweeter-web/src/presenter/ScrollerPresenter.ts) defines `ScrollerView<T>` and the shared paging implementation. [FolloweesPresenter.ts](tweeter-web/src/presenter/FolloweesPresenter.ts) defines the concrete followees presenter. The presenter owns the last item, page size (10), loading guard, accumulated items, and whether more pages exist.
3. [FollowService.ts](tweeter-web/src/model/service/FollowService.ts) implements `getFollowees` and accesses dummy data.
4. [FakeData.ts](tweeter-shared/src/util/FakeData.ts) returns a page and a boolean indicating whether another page exists.
5. The presenter calls its view callbacks; React updates state and renders the items.

**Observer pattern:** the view supplies an object implementing an interface. The presenter stores that interface and calls its methods. It never imports the React view or directly manipulates the DOM.

**Why this helps:** presenter logic can be tested with a fake view and fake service, without rendering React. Later, real backend requests can replace dummy implementations in services.

## Where to find the important code

All paths below are relative to this project folder.

| Topic | File / symbol |
| --- | --- |
| Login validation and request | [LoginPresenter.ts](tweeter-web/src/presenter/LoginPresenter.ts) |
| Registration validation and image conversion | [RegisterPresenter.ts](tweeter-web/src/presenter/RegisterPresenter.ts) |
| Followers list | [FollowersPresenter.ts](tweeter-web/src/presenter/FollowersPresenter.ts) |
| Followees list | [FolloweesPresenter.ts](tweeter-web/src/presenter/FolloweesPresenter.ts) |
| Feed list | [FeedPresenter.ts](tweeter-web/src/presenter/FeedPresenter.ts) |
| Story list | [StoryPresenter.ts](tweeter-web/src/presenter/StoryPresenter.ts) |
| Shared paging and observer interface | [ScrollerPresenter.ts](tweeter-web/src/presenter/ScrollerPresenter.ts) |
| Profile counts and follow/unfollow | [UserInfoPresenter.ts](tweeter-web/src/presenter/UserInfoPresenter.ts) |
| Posting and validation | [PostStatusPresenter.ts](tweeter-web/src/presenter/PostStatusPresenter.ts) |
| Logout | [AppNavbarPresenter.ts](tweeter-web/src/presenter/AppNavbarPresenter.ts) |
| User lookup and navigation (wired by useUserNavigation) | [UserNavigationPresenter.ts](tweeter-web/src/presenter/UserNavigationPresenter.ts) |
| External sign-in placeholder | [OAuthPresenter.ts](tweeter-web/src/presenter/OAuthPresenter.ts) |
| Remembered session | [UserInfoProviderPresenter.ts](tweeter-web/src/presenter/UserInfoProviderPresenter.ts) and [SessionService.ts](tweeter-web/src/model/service/SessionService.ts) |
| Shared message/loading observer contracts | [Presenter.ts](tweeter-web/src/presenter/Presenter.ts) |
| Dummy backend requests | [UserService.ts](tweeter-web/src/model/service/UserService.ts), [FollowService.ts](tweeter-web/src/model/service/FollowService.ts), [StatusService.ts](tweeter-web/src/model/service/StatusService.ts) |
| Domain objects | [User.ts](tweeter-shared/src/model/domain/User.ts), [Status.ts](tweeter-shared/src/model/domain/Status.ts), [AuthToken.ts](tweeter-shared/src/model/domain/AuthToken.ts) |
| Clickable mentions and URLs | [Post.tsx](tweeter-web/src/components/statusItem/Post.tsx) |
| Routes and four main views | [App.tsx](tweeter-web/src/App.tsx) |
| Focused automated checks | [test-mvp.cjs](tweeter-web/test-mvp.cjs) |

There are **12 concrete presenters**: Login, Register, Followers, Followees, Feed, Story, UserInfo, PostStatus, AppNavbar, UserNavigation, OAuth, and UserInfoProvider. Each concrete presenter has its own file. `ScrollerPresenter.ts` contains an additional abstract base class; `Presenter.ts` contains shared interfaces. Each has its own component or hook; display-only components and context-access hooks do not require presenters.

The **14 backend request types** are grouped by responsibility:

- UserService (4): login, register, get user, logout.
- FollowService (7): followers, followees, follower status, follower count, followee count, follow, unfollow.
- StatusService (3): feed, story, post status.

SessionService handles optional remembered-session storage separately.

## Run it in Ubuntu WSL

```bash
cd "/mnt/c/Users/joshu/Documents/Senior Year/340/tweeter-web-starter/tweeter-web-starter"
npm start --workspace tweeter-web
```

Open the URL Vite prints, usually `http://localhost:5173`. Stop the server with Ctrl+C. In another terminal, from the same project folder:

```bash
npm run build --workspace tweeter-web
npm run test:mvp --workspace tweeter-web
```

The build and presenter checks passed during the audit. The build emits CommonJS import and bundle-size warnings. Automated checks cover presenter behavior; use the browser to verify rendering and interactions.

## Quick demo checklist and expected results

- Sign in with any nonempty alias/password: you get the dummy user (`@allen`). Missing required inputs disable submission.
- Register with name, alias, password, and image: image preview appears; registration still signs in as the dummy user.
- Open Feed, Story, Followers, and Followees; scroll to load additional dummy entries.
- Click another user and a status mention; the displayed user changes, and a mention opens that user's story. Check browser back/forward and Return to logged in user.
- Click a URL: it opens the website in a new tab.
- Follow/unfollow another user: progress appears and the button toggles. **Counts do not change, and the choice is not saved.** The initial follow state is randomized when a profile loads.
- Post a status: progress and success messages appear, and the input clears. **The status does not get added to Story or Feed.** Blank posts are disabled.
- Logout: the session clears and the app returns to login.

No AWS backend calls are expected. The lists intentionally use the starter's dummy data, rather than real per-user feeds and relationships. Remember me retains the optional login session; it does not persist follows or posts.

## Be ready to explain

- **What moved out of React?** Validation, image conversion, paging/cursors, request handling, status construction, and decisions about success/error messages.
- **What stays in React?** Input events, state setters, rendering, and executing navigation/display callbacks.
- **How are failures handled?** Presenters catch service errors, call the view's error callback, and clear loading state in `finally` for action requests.
- **Why interfaces?** A presenter knows the operations its view supports, without depending on a concrete React component.
- **Why async/await?** Services return promises; presenters await results and then notify the view. A service-to-presenter observer is unnecessary.
- **How do you avoid duplicate or stale requests?** Busy/loading guards block repeated submissions; paging and profile generation counters discard results for an old selection.

The supplied spec says you can pass off only once. Join the TA queue at least one hour before their availability ends to guarantee same-day passoff. Check your course schedule for the actual due date and TA hours.
