// Run with node tweeter-web/test-mvp.cjs. Transpile presenters without a browser or test framework.
const fs = require('node:fs');
const ts = require('typescript');
const assert = require('node:assert/strict');
require.extensions['.ts'] = (module, filename) => {
  module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
  }).outputText, filename);
};
const { FakeData } = require('tweeter-shared');
const { UserService } = require('./src/model/service/UserService.ts');
const { FollowService } = require('./src/model/service/FollowService.ts');
const { LoginPresenter } = require('./src/presenter/LoginPresenter.ts');
const { RegisterPresenter } = require('./src/presenter/RegisterPresenter.ts');
const { FollowersPresenter } = require('./src/presenter/FollowersPresenter.ts');
const { FolloweesPresenter } = require('./src/presenter/FolloweesPresenter.ts');
const { FeedPresenter } = require('./src/presenter/FeedPresenter.ts');
const { StoryPresenter } = require('./src/presenter/StoryPresenter.ts');
const { AppNavbarPresenter } = require('./src/presenter/AppNavbarPresenter.ts');
const { PostStatusPresenter } = require('./src/presenter/PostStatusPresenter.ts');
const { UserInfoPresenter } = require('./src/presenter/UserInfoPresenter.ts');
const { UserNavigationPresenter } = require('./src/presenter/UserNavigationPresenter.ts');
const { SessionService } = require('./src/model/service/SessionService.ts');

async function main() {
  const user = FakeData.instance.firstUser, token = FakeData.instance.authToken;
  const events = [];
  const view = {
    setIsLoading: value => events.push(['loading', value]),
    displayError: message => events.push(['error', message]),
    displayInfo: () => 'toast', deleteMessage: id => events.push(['delete', id]),
    authenticated: (...args) => events.push(['auth', ...args]),
  };
  const service = new UserService();
  assert.equal((await service.login('anything', 'anything'))[0], user);
  assert.equal((await service.register('A', 'B', '@new', 'x', new Uint8Array(), 'png'))[0], user);
  const login = new LoginPresenter(view, service);
  assert.equal(login.isDisabled(' ', 'x'), true);
  assert.equal(login.isDisabled('@a', ''), true);
  await login.login('@a', 'x', false);
  assert.equal(events.find(e => e[0] === 'auth')[4], `/feed/${user.alias}`);
  events.length = 0;
  await new LoginPresenter(view, { login: async () => { throw Error('bad login'); } }).login('@a', 'x', false);
  assert.match(events.find(e => e[0] === 'error')[1], /bad login/);
  assert.deepEqual(events.at(-1), ['loading', false]);
  const register = new RegisterPresenter({ ...view, imageSelected: () => {} }, service);
  assert.equal(register.isDisabled('A', 'B', '@a', 'x'), true);
  await register.selectImage({ type: 'text/plain' });
  assert.match(events.find(e => e[0] === 'error' && /image/.test(e[1]))[1], /image/);

  for (const Presenter of [FollowersPresenter, FolloweesPresenter, FeedPresenter, StoryPresenter]) {
    let pages = [], hasMore = true;
    const list = new Presenter({ setItems: value => pages = value, setHasMoreItems: value => hasMore = value, displayError: message => { throw Error(message); } });
    list.reset(token, user); await new Promise(setImmediate);
    assert.equal(pages.length, 10);
    let requests = 1;
    while (hasMore && requests < 10) { await list.loadMoreItems(token, user); requests++; }
    assert.equal(hasMore, false);
    assert.equal(pages.length, Presenter === FollowersPresenter || Presenter === FolloweesPresenter ? 21 : 44);
    const count = pages.length; await list.loadMoreItems(token, user); assert.equal(pages.length, count);
  }

  let items = [], more, finish, calls = 0;
  const scroller = new FollowersPresenter({ setItems: value => items = value, setHasMoreItems: value => more = value, displayError: view.displayError }, {
    getFollowers: async () => { calls++; return new Promise(resolve => finish = resolve); }
  });
  scroller.reset(token, user); void scroller.loadMoreItems(token, user); assert.equal(calls, 1);
  scroller.reset(token, FakeData.instance.secondUser);
  finish([[user], false]); await new Promise(setImmediate);
  assert.equal(items.length, 1); assert.equal(more, false);
  let resolveOld;
  const stale = new FollowersPresenter({ setItems: value => items = value, setHasMoreItems: () => {}, displayError: view.displayError }, {
    getFollowers: () => new Promise(resolve => resolveOld = resolve)
  });
  stale.reset(token, user); stale.cancel(); resolveOld([[user], false]);
  await new Promise(setImmediate); assert.deepEqual(items, []);

  let following, followerCount = 8, followeeCount = 4;
  const profile = new UserInfoPresenter({ ...view, setIsFollower: value => following = value,
    setFollowerCount: value => followerCount = value, setFolloweeCount: value => followeeCount = value },
    { follow: async () => [9, 5], unfollow: async () => [7, 3] });
  await profile.changeFollow(token, user, true);
  assert.equal(following, true); assert.equal(followerCount, 9); assert.equal(followeeCount, 5);
  await profile.changeFollow(token, user, false);
  assert.equal(following, false); assert.equal(followerCount, 7); assert.equal(followeeCount, 3);

  const followService = new FollowService();
  followService.getFollowerCount = async (auth, selected) => {
    assert.equal(auth, token); assert.equal(selected, user); return 12;
  };
  followService.getFolloweeCount = async (auth, selected) => {
    assert.equal(auth, token); assert.equal(selected, user); return 6;
  };
  assert.deepEqual(await followService.follow(token, user), [12, 6]);
  assert.deepEqual(await followService.unfollow(token, user), [12, 6]);

  let finishFollow;
  const staleProfile = new UserInfoPresenter({ ...view, setIsFollower: value => following = value,
    setFollowerCount: value => followerCount = value, setFolloweeCount: value => followeeCount = value },
    { follow: () => new Promise(resolve => finishFollow = resolve) });
  const pendingFollow = staleProfile.changeFollow(token, user, true);
  staleProfile.cancel(); finishFollow([99, 99]); await pendingFollow;
  assert.equal(following, false); assert.equal(followerCount, 7); assert.equal(followeeCount, 3);

  let post = 'hello', posted;
  const posting = new PostStatusPresenter({ ...view, setPost: value => post = value }, {
    postStatus: async (auth, status) => { posted = status; assert.equal(auth, token); }
  });
  assert.equal(posting.isDisabled('  ', token, user), true);
  await posting.postStatus(post, token, user); assert.equal(post, ''); assert.equal(posted.user, user);
  let userInfoCleared = false, navigatedToLogin = false;
  await new AppNavbarPresenter({ ...view, clearUserInfo: () => userInfoCleared = true,
    navigateToLogin: () => navigatedToLogin = true }, { logout: async () => {} }).logout(token);
  assert.equal(userInfoCleared, true);
  assert.equal(navigatedToLogin, true);
  let selected, path;
  const navigation = new UserNavigationPresenter({ ...view, setDisplayedUser: value => selected = value, navigate: value => path = value }, service);
  await navigation.select(token, '@amy', '/story/@amy');
  assert.equal(selected.alias, '@amy'); assert.equal(path, '/story/@amy');
  await navigation.select(token, '@missing'); assert.match(events.at(-1)[1], /not found/);
  const storage = new Map();
  const sessions = new SessionService({ getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) });
  sessions.save(user, token, true); assert.equal(sessions.restore().currentUser.alias, user.alias);
  sessions.save(user, token, false); assert.equal(sessions.restore().currentUser, null);
  storage.set('CurrentUserKey', 'invalid json'); assert.equal(sessions.restore().currentUser, null);
  // Shared busy/error handling must keep one request in flight and release the guard after failure.
  let rejectLogin, loginCalls = 0;
  events.length = 0;
  const guardedLogin = new LoginPresenter(view, {
    login: () => { loginCalls++; return new Promise((_, reject) => rejectLogin = reject); },
  });
  const pendingLogin = guardedLogin.login('@a', 'x', true, '/story/@amy');
  await guardedLogin.login('@a', 'x', true);
  assert.equal(loginCalls, 1);
  assert.equal(guardedLogin.isDisabled('@a', 'x'), true);
  rejectLogin(Error('authentication unavailable')); await pendingLogin;
  assert.equal(guardedLogin.isDisabled('@a', 'x'), false);
  assert.match(events.find(e => e[0] === 'error')[1], /sign in.*authentication unavailable/);
  guardedLogin.service.login = async () => [user, token];
  await guardedLogin.login('@a', 'x', true, '/story/@amy');
  assert.deepEqual(events.find(e => e[0] === 'auth').slice(1), [user, token, true, '/story/@amy']);

  // Registration uses the same authentication flow, but still supplies its image and user fields.
  const originalReader = global.FileReader;
  global.FileReader = class {
    readAsDataURL() { this.result = 'data:image/png;base64,AQ=='; this.onload(); }
  };
  try {
    let registrationArgs;
    events.length = 0;
    const registration = new RegisterPresenter({ ...view, imageSelected: () => {} }, {
      register: async (...args) => { registrationArgs = args; return [user, token]; },
    });
    await registration.selectImage({ type: 'image/png', name: 'avatar.png', arrayBuffer: async () => new Uint8Array([1]).buffer });
    await registration.register('A', 'B', '@new', 'secret', true);
    assert.deepEqual(registrationArgs, ['A', 'B', '@new', 'secret', new Uint8Array([1]), 'png']);
    assert.deepEqual(events.find(e => e[0] === 'auth').slice(1), [user, token, true, `/feed/${user.alias}`]);
    registration.service.register = async () => { throw Error('registration unavailable'); };
    events.length = 0;
    await registration.register('A', 'B', '@new', 'secret', false);
    assert.match(events.find(e => e[0] === 'error')[1], /register.*registration unavailable/);
    assert.deepEqual(events.at(-1), ['loading', false]);
  } finally { global.FileReader = originalReader; }

  // Failed logout retains its progress toast per the milestone; other requests clean up.
  for (const run of [
    () => new AppNavbarPresenter({ ...view, clearUserInfo: () => assert.fail('user info cleared'),
      navigateToLogin: () => assert.fail('navigated to login') }, {
      logout: async () => { throw Error('offline'); },
    }).logout(token),
    () => new PostStatusPresenter({ ...view, setPost: () => assert.fail('post cleared') }, {
      postStatus: async () => { throw Error('offline'); },
    }).postStatus('keep this draft', token, user),
    () => new UserInfoPresenter({ ...view, setIsFollower: () => assert.fail('follow changed') }, {
      follow: async () => { throw Error('offline'); },
    }).changeFollow(token, user, true),
  ]) {
    events.length = 0;
    await run();
    assert.match(events.find(e => e[0] === 'error')[1], /offline/);
    assert.deepEqual(events.filter(e => e[0] === 'delete'), /log out/.test(events.find(e => e[0] === 'error')[1]) ? [] : [['delete', 'toast']]);
    assert.deepEqual(events.filter(e => e[0] === 'loading'), [['loading', true], ['loading', false]]);
  }

  // Paging failures stop loading; errors from a canceled page must not affect a newer view.
  events.length = 0;
  const failingPage = new FollowersPresenter({ setItems: () => {}, setHasMoreItems: value => more = value, displayError: view.displayError }, {
    getFollowers: async () => { throw Error('page unavailable'); },
  });
  failingPage.reset(token, user); await new Promise(setImmediate);
  assert.equal(more, false);
  assert.match(events.find(e => e[0] === 'error')[1], /followers.*page unavailable/);
  let rejectPage;
  events.length = 0;
  const canceledPage = new FeedPresenter({ setItems: () => {}, setHasMoreItems: () => {}, displayError: view.displayError }, {
    getFeed: () => new Promise((_, reject) => rejectPage = reject),
  });
  canceledPage.reset(token, user); canceledPage.cancel(); rejectPage(Error('old page'));
  await new Promise(setImmediate);
  assert.equal(events.length, 0);
  console.log('MVP checks passed: authentication, validation, paging, stale results, follow counts, posting, logout, navigation, sessions.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
