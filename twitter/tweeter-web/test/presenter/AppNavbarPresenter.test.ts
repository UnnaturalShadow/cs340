import { anything, instance, mock, spy, verify, when } from '@typestrong/ts-mockito';
import { AuthToken } from 'tweeter-shared';
import { AppNavbarPresenter, NavbarView } from '../../src/presenter/AppNavbarPresenter';
import { UserService } from '../../src/model/service/UserService';

describe('AppNavbarPresenter', () => {
  const token = new AuthToken('logout-token', 123);
  let view: NavbarView;
  let service: UserService;
  let presenter: AppNavbarPresenter;
  let presenterSpy: AppNavbarPresenter;

  // Fresh view/service mocks each test, instance() is what the presenter uses.
  beforeEach(() => {
    view = mock<NavbarView>();
    service = mock(UserService);
    when(service.logout(anything())).thenResolve();
    // Known toast ID lets us check that the same message gets deleted.
    when(view.displayInfo('Logging out...', 0)).thenReturn('logout-message');
    // Real presenter logic; replace only its service getter.
    presenterSpy = spy(new AppNavbarPresenter(instance(view)));
    presenter = instance(presenterSpy);
    when(presenterSpy.service).thenReturn(instance(service));
  });

  it('tells the view to display a logging out message', async () => {
    // Act, then verify interactions, await finishes the async logout first.
    await presenter.logout(token);
    verify(view.displayInfo('Logging out...', 0)).once();
  });

  it('passes the supplied auth token to the user service', async () => {
    await presenter.logout(token);
    verify(service.logout(token)).once();
  });

  it('clears the info message, clears user info, and navigates to login when successful', async () => {
    await presenter.logout(token);
    verify(view.deleteMessage('logout-message')).once();
    verify(view.clearUserInfo()).once();
    verify(view.navigateToLogin()).once();
    verify(view.displayError(anything())).never();
  });

  // Rejected Promise = service failure, never() checks success actions stay skipped.
  it('on failure reports the reason and retains the progress message and session', async () => {
    when(service.logout(anything())).thenReject(new Error('logout unavailable'));
    await presenter.logout(token);
    verify(view.displayError('Failed to log out: Error: logout unavailable')).once();
    verify(view.deleteMessage(anything())).never();
    verify(view.clearUserInfo()).never();
    verify(view.navigateToLogin()).never();
  });
});
