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

  beforeEach(() => {
    view = mock<NavbarView>();
    service = mock(UserService);
    when(service.logout(anything())).thenResolve();
    when(view.displayInfo('Logging out...', 0)).thenReturn('logout-message');
    presenterSpy = spy(new AppNavbarPresenter(instance(view)));
    presenter = instance(presenterSpy);
    when(presenterSpy.service).thenReturn(instance(service));
  });

  it('tells the view to display a logging out message', async () => {
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

  it('on failure reports the reason and retains the progress message and session', async () => {
    when(service.logout(anything())).thenReject(new Error('logout unavailable'));
    await presenter.logout(token);
    verify(view.displayError('Failed to log out: Error: logout unavailable')).once();
    verify(view.deleteMessage(anything())).never();
    verify(view.clearUserInfo()).never();
    verify(view.navigateToLogin()).never();
  });
});
