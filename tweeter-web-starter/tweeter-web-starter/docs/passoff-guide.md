# Milestone 2C passoff guide

## Quick demo

From the project root:

```sh
npm test
npm run build
npm start
```

`npm test` builds the shared module, runs Jest, then runs the standalone MVP checks. The last local verification passed **21 Jest tests in five suites**, the MVP checks, and the production build. The four required suites contain 19 tests; the extra navbar component suite contains two.

To show only the required tests with individual test names (after the shared module is built):

```sh
npm test --workspace tweeter-web -- --runInBand --verbose test/presenter test/components/Login.test.tsx test/components/PostStatus.test.tsx
```

## Where each requirement is tested

Paths below are relative to this document.

| Open this file | What to point out |
| --- | --- |
| [AppNavbarPresenter.test.ts](../tweeter-web/test/presenter/AppNavbarPresenter.test.ts) | Four tests: logging-out message, exact service token, success cleanup/session clearing/navigation, and failure error without those cleanup actions. |
| [PostStatusPresenter.test.ts](../tweeter-web/test/presenter/PostStatusPresenter.test.ts) | Four tests: posting message, exact service arguments, success cleanup/clear/confirmation, and failure cleanup/error without clearing the draft or confirming success. |
| [Login.test.tsx](../tweeter-web/test/components/Login.test.tsx) | Initial disabled state, enabling after both credentials, disabling when either is cleared, and correct login arguments. Parameterized cases also check Remember me both ways and the original URL. |
| [PostStatus.test.tsx](../tweeter-web/test/components/PostStatus.test.tsx) | Initial disabled buttons, enabling with text, disabling after erasure, correct submission arguments, and an extra Clear-button test. |
| [AppNavbar.test.tsx](../tweeter-web/test/components/AppNavbar.test.tsx) | Extra integration coverage: clicking Logout produces actual route and context effects using the real component/presenter with a stubbed service. |

## Presenter testing pattern

Start with `AppNavbarPresenter.test.ts` and explain **arrange → act → assert**:

```ts
// Arrange: fake collaborators, real presenter.
view = mock<NavbarView>();
service = mock(UserService);
when(view.displayInfo('Logging out...', 0)).thenReturn('logout-message');
presenterSpy = spy(new AppNavbarPresenter(instance(view)));
presenter = instance(presenterSpy);
when(presenterSpy.service).thenReturn(instance(service));

// Act.
await presenter.logout(token);

// Assert.
verify(service.logout(token)).once();
verify(view.deleteMessage('logout-message')).once();
```

- `mock` creates a controllable replacement for a dependency; `instance` gives the code under test the usable object.
- `spy` wraps the real presenter: its real logout/submission logic runs, while its service getter is replaced.
- `when(...).thenReturn(...)` supplies a result; `thenResolve()` models a successful asynchronous service call; `thenReject(...)` models a rejected Promise to exercise the failure path.
- `verify(...).once()` checks an expected interaction; `.never()` checks that forbidden success actions did not happen after failure.
- `beforeEach` creates fresh mocks for each test. `await` ensures the operation finishes before assertions.
- The known toast ID proves cleanup deletes the message that was actually created.

In `PostStatusPresenter.test.ts`, look at `capture(service.postStatus).last()`. The presenter constructs a new `Status`, so the test captures it and checks its text, author, and timestamp rather than comparing it to a separately constructed object.

## Component testing pattern

Start with `Login.test.tsx`:

- `render(...)` mounts the component in jsdom. `MemoryRouter` supplies routing context.
- `screen.getByRole(...)` and `getByLabelText(...)` find controls through their accessible roles and labels.
- `userEvent.setup()` supplies realistic typing, clearing, and clicking; interactions are awaited.
- `toBeDisabled()`, `toBeEnabled()`, and `toHaveValue()` assert the rendered UI state.
- `presenterFactory` injects a presenter spy through a component prop. The submission method is stubbed with `thenResolve()` so the test can verify delegation without authenticating or posting.
- Validation stays real: `isDisabled` is not stubbed, so typing exercises the actual enable/disable rules.
- `it.each(...)` repeats the same check for multiple inputs, such as clearing alias versus password.

In `PostStatus.test.tsx`, the top-level `jest.mock` replaces `useUserInfo`. `beforeEach` makes it return a known current user and auth token. Without those values, the real validation keeps posting disabled. This hook is a **default export**, which explains `default: jest.fn()` and `__esModule: true` in this project's mock.

## Names and behavior to explain to the TA

The posting presenter exposes **`postStatus(post, token, user)`**, matching the assignment's method name. The component test verifies `postStatus`, and the presenter test verifies that it calls **`StatusService.postStatus(token, status)`** with the original text inside the `Status` object.

Open [PostStatusPresenter.ts](../tweeter-web/src/presenter/PostStatusPresenter.ts), [AppNavbarPresenter.ts](../tweeter-web/src/presenter/AppNavbarPresenter.ts), and [Presenter.ts](../tweeter-web/src/presenter/Presenter.ts) to trace the behavior. Shared request handling manages loading, messages, and errors. Posting deletes its progress message on either outcome; logout passes `false` for failure cleanup, retaining the message on failure as required. The tests check the resulting calls, not their exact order.

## Configuration and tool roles

| File/tool | Purpose |
| --- | --- |
| [jest.config.cjs](../tweeter-web/jest.config.cjs) | Finds tests, selects jsdom, transforms TS/TSX with ts-jest, maps the shared library and CSS stub, and loads setup. |
| [tsconfig.test.json](../tweeter-web/tsconfig.test.json) | CommonJS test compilation and Jest/DOM matcher types. |
| [test/setup.ts](../tweeter-web/test/setup.ts) | Adds jest-dom matchers and registers OAuth icons needed during rendering. |
| Jest | Runs tests, assertions, and hook mocks. |
| `@typestrong/ts-mockito` | Creates mocks/spies, stubs collaborators, captures arguments, and verifies interactions. |
| React Testing Library + user-event | Renders components and interacts with their visible controls. |

The [course setup tutorial](https://github.com/BYU-CS-340/softwaredesign/blob/main/tweeter/milestone-2c/tweeter-project-testing-setup-tutorial.md) uses these testing libraries. This repository keeps Jest configuration in a separate file and uses ts-jest directly for TypeScript.

## Changes made for this Mac

Installed workspace dependencies for this machine, removed the bundled `node` dependency that overrode the installed runtime, added root `start`/`build`/`test` scripts, and updated setup instructions. The assignment tests were already present when this Mac setup began.

## Before joining the queue

Run the commands above and briefly check login, posting, clearing a draft, and logout in the browser. Be ready to show one success test, one failure test, one button-state test, and the hook mock. The app still uses simulated services, so these tests do not establish that a real backend works.

The existing [milestone report](milestone-2-report.md) is separate from this study guide. Check it against the linked [report requirements](https://github.com/BYU-CS-340/softwaredesign/blob/main/tweeter/milestone-2c/milestone-2c-docs.md) before submission; those requirements could not be fetched during preparation of this guide.
