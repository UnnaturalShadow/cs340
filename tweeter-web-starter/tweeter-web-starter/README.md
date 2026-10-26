# Tweeter-Web

A starter project for the Tweeter Web application.

## Setting Up the Project

Install Node.js and npm, then run these commands from the project root (the folder containing this README):

```sh
npm ci
npm run build
npm start
```

The project uses npm workspaces, so one install sets up both `tweeter-shared` and `tweeter-web`. Run `npm ci` on each machine instead of copying `node_modules` between Windows/WSL and macOS; dependencies include platform-specific binaries.

## Running the Project

Run `npm start` from the project root. It builds the shared module and starts the Vite development server, normally at http://localhost:5173. Vite prints the actual URL and opens your browser. Stop it with Ctrl+C.

The existing `npm start` command inside `tweeter-web` also works after the shared module has been built.

## Rebuilding and Testing

Run `npm run build` from the project root to build both workspaces in dependency order. Run `npm test` to build the shared module and run the Jest suite and presenter checks.

The web development server updates when web source files change. After changing `tweeter-shared`, run `npm run build --workspace tweeter-shared` or restart the root `npm start` command. If VS Code cannot resolve `tweeter-shared` after building, restart its TypeScript server or reload the window.

## Milestone 1 structure

- `StatusItem` renders each status in both the feed and story.
- `AuthenticationFields` shares the alias/password fields, with separate login and registration Enter handlers.
- `OAuth` owns the five provider buttons, tooltips, and placeholder toasts.
- `UserItemScroller` serves followers and followees; `StatusItemScroller` serves feed and story. Routes supply their feature paths, and changing users resets pagination.
- `useMessageActions`, `useMessageList`, `useUserInfoActions`, and `useUserInfo` hide context access from UI consumers. Context providers still own and publish their contexts.
- `useUserNavigation` handles user links and returning to the logged-in user. `MainLayout` uses it to synchronize the displayed user with the URL during back/forward navigation.

The starter's fake data and placeholder server/OAuth behavior remain in place for this milestone.

From the project root on macOS, Linux/WSL, or Windows, the workspace commands also work directly:

```sh
npm ci
npm run build --workspace tweeter-shared
npm run build --workspace tweeter-web
npm start --workspace tweeter-web
```

Manual functionality checks:

1. Verify login and registration required fields, Enter submission, image preview, and Remember me.
2. Click each OAuth icon and verify its message appears and can be dismissed.
3. Visit feed, story, followers, and followees; scroll to load additional pages.
4. Click author aliases and mentions, return to the logged-in user, and use browser back/forward. Confirm the profile and list update together.
5. Exercise follow/unfollow, post a status, and log out. These retain the starter's simulated behavior.
