# Tweeter-Web

A starter project for the Tweeter Web application.

## Setting Up the Project

1. cd into the project root folder
1. Run 'npm install'
1. cd into the tweeter-shared folder
1. Run 'npm install'
1. Run 'npm run build'
1. cd into the tweeter-web folder
1. Run 'npm install'
1. Run 'npm run build'

**Note:** VS Code seems to have a bug. After doing this, you should be able to run the project but code editors report that they can't see the 'tweeter-shared' module. Restarting VS Code fixes the problem. You will likely need to restart VS Code every time you compile or build the 'tweeter-shared' module.

**Note:** If you are using Windows, make sure to use a Git Bash terminal instead of Windows Powershell. Otherwise, the scripts won't run properly in tweeter-shared and it will cause errors when building tweeter-web.

## Rebuilding the Project

Rebuild either module of the project (tweeter-shared or tweeter-web) by running 'npm run build' after making any code or configuration changes in the module. The 'tweeter-web' module is dependent on 'tweeter-shared', so if you change 'tweeter-shared' you will also need to rebuild 'tweeter-web'. After rebuilding 'tweeter-shared' you will likely need to restart VS Code (see note above under 'Setting Up the Project').

## Running the Project

Run the project by running 'npm start' from within the 'tweeter-web' folder.

## Milestone 1 structure

- `StatusItem` renders each status in both the feed and story.
- `AuthenticationFields` shares the alias/password fields, with separate login and registration Enter handlers.
- `OAuth` owns the five provider buttons, tooltips, and placeholder toasts.
- `UserItemScroller` serves followers and followees; `StatusItemScroller` serves feed and story. Routes supply their feature paths, and changing users resets pagination.
- `useMessageActions`, `useMessageList`, `useUserInfoActions`, and `useUserInfo` hide context access from UI consumers. Context providers still own and publish their contexts.
- `useUserNavigation` handles user links and returning to the logged-in user. `MainLayout` uses it to synchronize the displayed user with the URL during back/forward navigation.

The starter's fake data and placeholder server/OAuth behavior remain in place for this milestone.

From the project root in WSL, install and build with:

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
