# Milestone 2 Part C: MVP and Template Method

## Question 1. Getting and displaying a user's story

### 1. Roles, relationships, and the dependency rule

The view consists of the Story React component and its ItemScroller<Status> child. Story supplies the StoryPresenter factory and renders each status through StatusItem. ItemScroller owns React state for items and hasMoreItems; it supplies a PagedPresenterView<Status> object whose setItems, setHasMoreItems, and displayError callbacks update state or display an error toast.

StoryPresenter is the concrete presenter. It inherits the paging algorithm from PagedPresenter<Status, StatusService> through PagedStatusItemPresenter. Its getMoreItems override calls StatusService.getStory(token, user, lastItem, pageSize), and its getItemDescription override supplies "story" for error messages. The inherited pageSize is 10.

The model includes StatusService and the shared Status, User, AuthToken, and FakeData types. StatusService.getStory currently delegates to getFeed, which returns a page of hardcoded statuses from FakeData. There is no network request or persistent story update at this milestone.

The view depends on presenter types and constructs StoryPresenter through a factory. The presenter depends on the PagedPresenterView interface, not on React, ItemScroller, StatusItem, or the toast implementation. PagedPresenterView extends MessageView for displayError. The view supplies the implementation of that interface, so callbacks cross back into the UI without a presenter importing the UI layer. The model imports no view or presenter. Shared domain types can be used across layers. These source dependencies preserve the UI-to-presenter-to-model direction; the diagram's callback arrows represent runtime calls, not reverse imports.

When authToken or displayedUser changes, ItemScroller's effect calls reset. Reset clears the items and cursor, increments a generation counter, and starts loading if both arguments exist. loadMoreItems checks the loading and has-more guards, awaits the subclass hook, appends the returned page, updates the cursor, and calls the view callbacks. InfiniteScroll renders the updated items and requests another page through loadMoreItems. Effect cleanup calls cancel, which invalidates pending results.

### 2. Why MVP is effective here

1. Separation of responsibilities: ItemScroller renders state, StoryPresenter chooses the story operation, and StatusService supplies dummy model data. Replacing dummy data with a backend can happen in the service without moving paging logic into React.
2. Testability: presenters can receive a fake view and service without mounting React. View tests can substitute a presenter. The milestone's navbar and posting tests use these same boundaries.
3. Reuse and consistent behavior: StoryPresenter and FeedPresenter share paging, error handling, cancellation, and concurrency guards while selecting different service methods. The same ItemScroller renders either list.

The PDF contains the corresponding class and sequence diagrams. The sequence shows a successful first page; errors call displayError and setHasMoreItems(false), and canceled/stale requests skip state updates.

## Question 2. Template Method in paged presenters

### A. Roles and collaboration

PagedPresenter<T, U> is the abstract class. Its loadMoreItems method is the template method: it fixes the ordering of the guard checks, request tracking, call to getMoreItems, stale-result check, page accumulation, cursor update, view updates, and loading cleanup. It uses inherited doFailureReportingOperation for the shared try/catch, with an onFailure callback that stops further paging. reset and cancel manage the generation counter and list lifecycle.

getMoreItems(token, user) and getItemDescription() are abstract hooks. createService() is another abstract hook used by the lazy service getter. PagedStatusItemPresenter provides the StatusService factory; StoryPresenter and FeedPresenter provide the concrete service calls and descriptions. StoryPresenter calls getStory, FeedPresenter calls getFeed, and both use the inherited lastItem and pageSize. PagedUserItemPresenter similarly supplies FollowService for the follower and followee presenters.

### B. How duplication is reduced

Without this shared algorithm, separate story and feed loaders would each need items, last, more, loading, generation, page size, guards, error handling, appending, and view updates. PagedPresenter stores and implements these once. The concrete presenters retain only their different service call and descriptive label. A correction to stale-result handling or cursor advancement therefore applies to both lists, as well as follower/followee pagination.

The PDF's "before" diagram is a conceptual reconstruction of duplicated loaders before extracting the shared algorithm, not a claim that those exact standalone classes appear in git history. The repository already used a callback-based shared ScrollerPresenter before the current hook-based hierarchy (for example, commit cc6e151). That earlier implementation already removed paging duplication; the current template-method design preserves that reuse and expresses the variation through protected overrides rather than bound callback constructor arguments. The "after" diagram reflects the current source, with only members relevant to the explanation shown.

## Source map

- View: tweeter-web/src/components/mainLayout/Story.tsx, ItemScroller.tsx; components/statusItem/StatusItem.tsx.
- Presenter: tweeter-web/src/presenter/StoryPresenter.ts, FeedPresenter.ts, PagedStatusItemPresenter.ts, PagedPresenter.ts, Presenter.ts.
- Model: tweeter-web/src/model/service/StatusService.ts; tweeter-shared/src/model/domain and util/FakeData.ts.

## Assignment references

- Testing setup: https://github.com/BYU-CS-340/softwaredesign/blob/main/tweeter/milestone-2c/tweeter-project-testing-setup-tutorial.md
- Report requirements: user-supplied Milestone 2 Part C: Documents.
