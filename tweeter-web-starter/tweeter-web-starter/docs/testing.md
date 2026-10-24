# Milestone 2 tests

From the repository root:

```sh
npm ci
npm run build --workspace tweeter-shared
npm test --workspace tweeter-web -- --runInBand
npm run test:mvp --workspace tweeter-web
npm run build --workspace tweeter-web
```

Jest uses jsdom and ts-jest with a separate test TypeScript configuration. CSS imports map to a style stub. Tests live outside `__mocks__`; only the style stub lives there. The setup follows the course tutorial's Jest/ts-mockito/React Testing Library approach; ts-jest handles TypeScript directly, so a Babel transform is unnecessary for the current CommonJS dependencies.

| Suite | Required coverage |
| --- | --- |
| AppNavbarPresenter | Logging-out toast; exact auth token; success cleanup, clear-user-info and login-navigation callbacks; failure error without cleanup or navigation |
| PostStatusPresenter | Posting toast; exact token, text and author; success cleanup/clear/confirmation; failure cleanup/error and preservation of draft |
| Login | Initially disabled; enabled after both fields contain text; disabled when either is cleared; exact login arguments including remember-me and original URL |
| PostStatus | Both buttons initially disabled; enabled by text; disabled after erasure; Clear behavior; exact submission arguments |

The local posting presenter calls its operation `submit`, not `postStatus`; the tests use `submit` and verify the resulting `StatusService.postStatus` call. The service accepts an AuthToken and Status object rather than a raw string. The tests inspect the Status's text, author, and timestamp.

Following the presenter video, each presenter suite has four focused tests, creates fresh view/service mocks in `beforeEach`, creates a spy on the real presenter, and stubs its `service` getter with `when(...).thenReturn(instance(mockService))`. Tests invoke `instance(presenterSpy)`, verify calls on mocks, and use `thenThrow` for the demonstrated failure case. Toast creation returns a known ID, which the success test verifies is passed to deletion, including the video's final correction.

The navbar view exposes separate `clearUserInfo()` and `navigateToLogin()` callbacks so the presenter tests verify both calls directly, as in the video. Navbar integration tests additionally check the actual navigation to `/login` and session cleanup.

Component tests inject `instance(presenterSpy)` through an optional factory. ts-mockito spies stub only the submission methods, preserving real validation for the button-state checks. The PostStatus test mocks the default-exported useUserInfo hook with Jest to provide a user and auth token. The supplied transcript covers presenter tests; component tests follow the written spec pending the separate component video.

The required logout failure behavior differs from other requests: it retains the progress toast. RequestPresenter accepts a cleanup option, defaulting to cleanup on both success and failure; only logout opts out of failure cleanup. The existing standalone MVP check reflects this requirement.

Verified in Ubuntu WSL: all 21 tests across five suites, the existing MVP regression checks, and the production build. Vite still emits CommonJS export and bundle-size warnings from the existing shared-library/build setup.

For this working folder, dependencies are stored on WSL's native Linux filesystem and linked from the project's `node_modules`. This avoids unreliable reads and extraction on the Windows mount. The previous mounted dependency directories are preserved under ignored `tmp/` backups. Run development commands through WSL.

If package extraction on the Windows mount produces corrupted dependencies, run `bash docs/verify-wsl.sh` from the project root. It makes a source-only copy in a new `/tmp/tweeter-milestone2.*` directory, installs locked dependencies there, compiles the shared library, and runs all checks. It records that directory in `tmp/wsl-verification-path.txt`.

The editable report is `docs/milestone-2-report.md`. With ReportLab installed, run `python3 docs/build_report.py` to regenerate the PDF. With PyMuPDF installed, `python3 docs/verify_report.py` renders all four pages for visual review. `python3 docs/package_submission.py` creates the project ZIP and checks its integrity.
