# Milestone 2B: your pass-off guide

Read sections 1-4 first. They are the main explanation to practice. Sections 5-8 are reference material.

All `src/` paths below are inside `tweeter-web/`.

## 1. What to say first

> I removed repeated workflows, not just repeated lines. The paging presenters share one loading algorithm through inheritance and Template Method. Generics let that algorithm handle both users and statuses. Functions passed as parameters share error reporting and authentication. In the view, reusable components and a hook share scrolling, user rows, loading buttons, and authentication callbacks.

You do not need to memorize every base class. Be able to explain these five examples:

| Technique | Simple meaning | Your example |
| --- | --- | --- |
| Inheritance | A child reuses behavior from a parent. | `FollowersPresenter` inherits paging behavior. |
| Template Method | The parent defines the steps; children fill in the steps that differ. | `loadMoreItems()` calls the child's `getMoreItems()`. |
| Generics | Reuse code while keeping the types consistent. | `PagedPresenter<User, FollowService>` versus `PagedPresenter<Status, StatusService>`. |
| Functions as parameters | Pass the work into a helper that handles the common surrounding steps. | `authenticate(() => this.service.login(...), ...)`. |
| Composition/delegation | Use another object or component to do part of the job. | A presenter calls its service; a scroller renders `StatusItem`. |

React components and hooks are additional examples of sharing view code. They stay in the view layer.

## 2. Five examples to show in the editor

### Example A: paging - your best Template Method example

Open these files in this order:

1. [FollowersPresenter.ts](tweeter-web/src/presenter/FollowersPresenter.ts)
2. [PagedUserItemPresenter.ts](tweeter-web/src/presenter/PagedUserItemPresenter.ts)
3. [PagedPresenter.ts](tweeter-web/src/presenter/PagedPresenter.ts)
4. [FeedPresenter.ts](tweeter-web/src/presenter/FeedPresenter.ts)

The structure is:

```text
Presenter<V>
  ErrorReportingPresenter<V>
    PagedPresenter<T, U>
      PagedUserItemPresenter       T = User,   U = FollowService
        FollowersPresenter
        FolloweesPresenter
      PagedStatusItemPresenter     T = Status, U = StatusService
        FeedPresenter
        StoryPresenter
```

**What used to repeat:** loading a page, tracking the last item, appending results, deciding whether more pages exist, and reporting failures.

**What happens now:** `PagedPresenter.loadMoreItems()` owns that whole workflow. It calls two abstract methods:

- `getMoreItems(token, user)` gets the feature's next page.
- `getItemDescription()` supplies the feature name for an error message.

Each concrete presenter implements only those two differences. For example:

```ts
protected getMoreItems(token: AuthToken, user: User): Promise<[User[], boolean]> {
  return this.service.getFollowers(token, user, this.lastItem, this.pageSize);
}

protected getItemDescription(): string { return "followers"; }
```

**Say this:** "`loadMoreItems()` is the template method. It defines the algorithm once. My subclasses provide the service call and description through overridden methods."

The user/status intermediate classes implement `createService()`. Followers and followees share one place that creates `FollowService`; feed and story share one place that creates `StatusService`.

**Why the tiny concrete classes are okay:** the video ends with these two small methods. Repeating their signatures is necessary to implement the extension points. The substantial workflow exists once. A constructor that only forwards to the parent is unnecessary, so these classes inherit it.

**Explain the generic letters:**

- `T` is the item type: `User` or `Status`.
- `U` is the service type: `FollowService` or `StatusService`.
- `V` in `Presenter<V>` is the view contract: which callbacks the presenter can use.

`T` connects the item list, cursor, page results, and view callbacks. A status page cannot accidentally be treated as a user page. `U` lets the concrete presenter use the correct service methods.

### Example B: one error-reporting workflow

Open [Presenter.ts](tweeter-web/src/presenter/Presenter.ts), then [UserNavigationPresenter.ts](tweeter-web/src/presenter/UserNavigationPresenter.ts).

**What used to repeat:** `try`, await some work, `catch`, format an error, tell the view to display it.

**What happens now:** `doFailureReportingOperation()` accepts:

- An async function containing the work.
- A description, such as `"get user"`.
- Optional rules for ignoring stale failures or updating failure state.

The helper awaits the function and formats the error in one place. Every call to this async helper is awaited.

**Say this:** "The operation changes, but error handling stays the same. I pass the changing work as a function and keep the common try/catch in the helper."

Why pass a function instead of an already-started promise? The helper controls when the work starts, and its `try` also catches synchronous errors thrown while starting that work.

The same file contains three other shared pieces:

| Piece | What it shares |
| --- | --- |
| `Presenter<V>` | Stores the view once, inherited by every presenter. |
| `BusyPresenter` | Prevents overlapping submissions and turns loading on/off. |
| `RequestPresenter` | Shows a progress toast and always removes it afterward. |

`finally` means cleanup runs on success and failure. These remaining `try/finally` blocks handle different resources; they are not repeated error-reporting implementations.

### Example C: login and registration

Open [LoginPresenter.ts](tweeter-web/src/presenter/LoginPresenter.ts), [RegisterPresenter.ts](tweeter-web/src/presenter/RegisterPresenter.ts), and [AuthenticationPresenter.ts](tweeter-web/src/presenter/AuthenticationPresenter.ts).

**What used to repeat:** call the authentication service, receive `[user, token]`, notify the view, and choose where to navigate.

Login now passes its different operation:

```ts
await this.authenticate(
  () => this.service.login(alias, password), remember, "sign in", originalUrl,
);
```

Registration passes a function calling `service.register(...)` instead.

The shared `authenticate()` method:

1. Uses the common busy/loading workflow.
2. Awaits the supplied service operation.
3. Receives the user and token.
4. Calls `view.authenticated(...)` with the destination.

The view's [useAuthenticationView.ts](tweeter-web/src/hooks/useAuthenticationView.ts) hook shares session updates, error toasts, and React navigation.

**Say this:** "Login and registration do the same sequence with different service calls. I pass those calls as functions instead of copying the sequence."

**The function-inside-a-function requirement:** the supplied service function runs inside the async callback passed to `doBusyOperation()`. That callback goes through `doFailureReportingOperation()`. The shared wrappers still await all the work.

Login keeps its original destination when supplied. Registration goes to the feed. Registration-specific name/image checks and image conversion stay in its presenter. Both share the existing nonempty alias/password validation.

### Example D: follow and unfollow

Open [UserInfoPresenter.ts](tweeter-web/src/presenter/UserInfoPresenter.ts), then [FollowService.ts](tweeter-web/src/model/service/FollowService.ts).

**What used to repeat:** progress messages, service calls, changing follower state, updating counts, and cleaning up loading/toasts.

`changeFollow(token, selected, follow)` handles both directions:

- `follow === true` calls `service.follow()`.
- `follow === false` calls `service.unfollow()`.
- Both receive `[followerCount, followeeCount]` and update the view in one place.
- `RequestPresenter` handles the progress toast, errors, and loading cleanup.

The service shares the temporary two-second delay and count retrieval in `simulateFollowChange()`. Separate follow/unfollow methods retain TODOs for their future server endpoints.

**Say this:** "The sequence is identical. Only the service operation, wording, and final following state change, so one method handles both."

The current counts come from dummy data. They are returned and applied, but clicking does not persist a relationship or guarantee a numerical change. That is expected for this milestone.

### Example E: one generic scrolling view

Open [ItemScroller.tsx](tweeter-web/src/components/mainLayout/ItemScroller.tsx), then [Feed.tsx](tweeter-web/src/components/mainLayout/Feed.tsx) and [Followers.tsx](tweeter-web/src/components/mainLayout/Followers.tsx).

**What used to repeat:** React list state, presenter construction, loading more, resetting when the user changes, and infinite-scroll markup.

`ItemScroller<T>` owns those things once. Each feature supplies:

- `presenterFactory`: constructs the correct presenter.
- `itemComponentGenerator(item)`: returns the JSX for one item.
- `itemKey`: gives React a key for each row.

**Say this:** "The scroller handles the list lifecycle. A function passed as a prop tells it how to render each item. Generics keep the item type and renderer consistent."

Other shared view pieces:

| Piece | Reused by |
| --- | --- |
| `UserItemLayout` | User rows and status rows share the avatar, name, and author link. Status content is passed as `children`. |
| `LoadingButton` | Authentication, posting, and follow buttons share spinner/label markup. |
| `AuthenticationFields` / `AuthenticationFormLayout` | Login and registration share fields and form layout. |
| `useAuthenticationView` | Login and registration share loading state and view callbacks. |
| `useUserNavigation` | User links share navigation behavior. |

## 3. Questions the TA might ask

**Where is Template Method?**

`PagedPresenter.loadMoreItems()`. The parent owns the sequence and calls overridden `getMoreItems()` and `getItemDescription()` methods.

**How is that different from passing a function?**

Template Method gets variation through subclass overrides. `authenticate()` and `doFailureReportingOperation()` get variation through function arguments. We use both techniques.

**Why have the user/status intermediate classes?**

They bind both generic types and create the right service once per family. Without them, followers/followees would repeat service creation, and feed/story would repeat it too.

**Why not use `User | Status` everywhere?**

A union allows either type. `T` keeps one selected type consistent across the list, cursor, view, and page result.

**Inheritance versus composition?**

Inheritance: a follower presenter is a kind of paged presenter. Composition: the presenter has a service and delegates data access to it. React also composes smaller components.

**Where does the view live?**

Only `Presenter<V>` stores it. Subclasses inherit the correctly typed reference. No duplicate view fields or recursive getters.

**Why are there generation numbers?**

A request might finish after switching users or leaving a view. Each reset/cancel changes the generation. Old responses and failures are ignored, so they cannot overwrite the current view.

**Why aren't all similar lines extracted?**

We share substantial workflows. Short feature-specific overrides and callback adapters still express real differences. Adding a helper for every similar line would make the code harder to follow.

**How many presenters are there?**

12 concrete presenters: Feed, Story, Followers, Followees, Login, Register, OAuth, AppNavbar, PostStatus, UserInfo, UserInfoProvider, and UserNavigation. Abstract parents are not extra presenter objects attached to a view.

**Why no React in the presenters?**

Presenters expose view callbacks and call services. Components/hooks translate those callbacks into React state, routing, and toasts. That preserves the MVP layers.

## 4. Practice this demo before pass-off

- [ ] Log in with nonempty credentials. The dummy user is expected.
- [ ] Register with names, credentials, and an image. The dummy user is still expected.
- [ ] Scroll Feed, Story, Followers, and Followees until each stops requesting pages.
- [ ] Click author/user links. Confirm the selected user changes and the current tab is preserved.
- [ ] Click a mention from Feed and Story. It should preserve that tab too.
- [ ] Click an external URL. It should open the webpage.
- [ ] Follow and unfollow another user. Confirm the progress message, button state, counts, and cleanup.
- [ ] Post a status. Confirm success and a cleared draft. It need not appear in Story.
- [ ] Log out.
- [ ] Walk through examples A-E above without reading the suggested answers word for word.

## 5. How this matches the course references

The paging hierarchy and its two small concrete overrides match the PDF and the transcript's final implementation. The transcript also specifically calls out login/register and follow/unfollow duplication; examples C and D address those.

Small implementation differences you can explain if asked:

| Difference | Reason |
| --- | --- |
| `setItems()` instead of the diagram's `addItems()` | The presenter accumulates items and sends the full list to React. |
| `reset()` and `cancel()` | Preserve lifecycle handling and ignore old requests. |
| `ErrorReportingPresenter` between the base and paging classes | Shares errors only with views that support them; OAuth/session views do not need that contract. |
| Our `MessageView` is error-only | It corresponds to the diagram's `View`. Our `RequestView` adds progress-message operations. |
| Lazy service getter | Calls `createService()` on first access, caches it, and supports injected test services. Avoids calling an override during base construction. |
| One authentication callback plus a destination | Our hook already combines session updates and navigation, so a separate navigation function is unnecessary. |

The video's empty `Service` marker interface is optional. An empty TypeScript interface does not actually restrict values to service classes. Our intermediate classes bind `U` to the real service APIs instead.

## 6. File change map

This is a lookup list, not material to memorize.

| File(s), relative to `tweeter-web/` | Shared behavior / reason |
| --- | --- |
| `src/presenter/Presenter.ts` | View ownership, error contracts/reporting, busy state, request-toast cleanup. |
| `src/presenter/PagedPresenter.ts` | Generic service/item state and the paging template method. Replaces `ScrollerPresenter.ts`. |
| `src/presenter/PagedUserItemPresenter.ts`, `PagedStatusItemPresenter.ts` | User/status type bindings and service factories. |
| `src/presenter/FollowersPresenter.ts`, `FolloweesPresenter.ts`, `FeedPresenter.ts`, `StoryPresenter.ts` | Keep only the two feature-specific template-method overrides. |
| `src/presenter/AuthenticationPresenter.ts` | Shared service, credential checks, authentication result handling, destination. |
| `src/presenter/LoginPresenter.ts`, `RegisterPresenter.ts` | Supply different authentication operations; retain their distinct inputs/validation. |
| `src/presenter/AppNavbarPresenter.ts`, `PostStatusPresenter.ts`, `UserInfoPresenter.ts` | Use common request cleanup; follow/unfollow also share one method. |
| `src/presenter/UserNavigationPresenter.ts` | Uses common view/error handling; retains route/user lookup logic. |
| `src/presenter/OAuthPresenter.ts`, `UserInfoProviderPresenter.ts` | Inherit view ownership without unused error/loading callbacks. |
| `src/components/mainLayout/ItemScroller.tsx` | One generic scrolling view and lifecycle. |
| `src/components/mainLayout/Feed.tsx`, `Story.tsx`, `Followers.tsx`, `Followees.tsx` | Small scroller configurations with item renderers. |
| `src/components/userItem/UserItemLayout.tsx`, `UserItem.tsx`, `src/components/statusItem/StatusItem.tsx` | Share author/avatar/row layout; status rows supply extra content as children. |
| `src/components/statusItem/Post.tsx` | Mentions use the supplied feature path to preserve the current tab. |
| `src/components/LoadingButton.tsx` | Shared spinner/label rendering. |
| `src/components/authentication/AuthenticationFormLayout.tsx`, `src/components/postStatus/PostStatus.tsx`, `src/components/userInfo/UserInfoComponent.tsx` | Use the loading button; follow/unfollow also share one click handler. |
| `src/hooks/useAuthenticationView.ts`, authentication `login/Login.tsx` and `register/Register.tsx` | Share authentication state, session updates, errors, and navigation. |
| `src/components/appNavbar/AppNavbar.tsx` | Generate repeated navigation links from route/label data. |
| `src/model/service/FollowService.ts`, `StatusService.ts` | Share identical dummy-data operations while retaining separate public endpoint methods. |
| `test-mvp.cjs` | Checks presenter success, failure, paging, validation, and stale-request behavior. |

The four scrolling views in this checkout were separate implementations, rather than files named `UserItemScroller` and `StatusItemScroller`. They now use the single generic scroller requested by the assignment.

## 7. Review results and verification limits

The final review found no remaining substantial duplicated presenter workflow. The intentionally short paging overrides match the course approach. The review also consolidated repeated row markup, follow click handlers, and stale-error formatting.

Checks passed:

- TypeScript checking.
- Presenter tests: all four pagers stop at the end, old results/errors are ignored, authentication/validation work, duplicate login is prevented, registration passes image bytes, follow counts are applied, and posting/logout/navigation/session behavior works.
- Request failure tests: errors are reported, progress toasts are removed, and loading is cleared.
- Static React rendering: shared rows render, author/mention links keep their feature path, and external URLs remain links.
- Git whitespace checks.

Static rendering is not a browser interaction test. Complete the manual checklist in section 4 before pass-off. No grade or complete browser verification is implied by these checks.

This Windows session needed a process-local resolver for the existing broken `tweeter-shared` package link when running tests. The last production-build attempt was blocked by Linux-only `esbuild` dependencies installed in this Windows checkout. No dependency replacement was made during this review. Run the normal tests/build in your WSL environment as below.

## 8. Run from WSL Ubuntu

From the project root:

```bash
cd "/mnt/c/Users/joshu/Documents/Senior Year/340/tweeter-web-starter/tweeter-web-starter"
npm install
npm run build --workspace tweeter-shared
npm run test:mvp --workspace tweeter-web
npm run build --workspace tweeter-web
npm run start --workspace tweeter-web -- --host 0.0.0.0
```

Open the localhost URL Vite prints. Keep installing and running dependencies from WSL so Linux and Windows native packages do not get mixed.

The local class diagram was visually inspected and the supplied presenter-video transcript was reviewed. The video itself was not fetched. This guide describes the current implementation, including the small differences in section 5.
