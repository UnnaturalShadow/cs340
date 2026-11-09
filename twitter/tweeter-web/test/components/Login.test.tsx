import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { instance, mock, spy, verify, when } from '@typestrong/ts-mockito';
import { MemoryRouter } from 'react-router-dom';
import Login from '../../src/components/authentication/login/Login';
import { LoginPresenter, LoginView } from '../../src/presenter/LoginPresenter';

describe('Login', () => {
  function setup(originalUrl?: string) {
    const presenter = new LoginPresenter(instance(mock<LoginView>()));
    const presenterSpy = spy(presenter);
    // Leave isDisabled real so the button tests exercise actual validation.
    when(presenterSpy.login('@test', 'secret', true, originalUrl)).thenResolve();
    when(presenterSpy.login('@test', 'secret', false, originalUrl)).thenResolve();
    // Router supplies context; factory injects our spy instead of a new presenter.
    render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><Login originalUrl={originalUrl} presenterFactory={() => instance(presenterSpy)} /></MemoryRouter>);
    return {
      // Find controls by labels/roles, interact like a user.
      user: userEvent.setup(), presenterSpy,
      alias: screen.getByLabelText('Alias'),
      password: screen.getByLabelText('Password'),
      button: screen.getByRole('button', { name: 'Sign in' }),
    };
  }

  it('initially disables Sign in', () => {
    expect(setup().button).toBeDisabled();
  });

  it('enables Sign in only after both credentials contain text', async () => {
    const { user, alias, password, button } = setup();
    await user.type(alias, '@test');
    expect(button).toBeDisabled();
    await user.type(password, 'secret');
    expect(button).toBeEnabled();
  });

  // Same test twice: clearing either credential must disable sign-in.
  it.each(['alias', 'password'] as const)('disables Sign in when the %s is cleared', async field => {
    const controls = setup();
    await controls.user.type(controls.alias, '@test');
    await controls.user.type(controls.password, 'secret');
    expect(controls.button).toBeEnabled();
    await controls.user.clear(controls[field]);
    expect(controls.button).toBeDisabled();
  });

  // Check both Remember me values and exact arguments passed to the presenter.
  it.each([false, true])('calls login with credentials, remember=%s, and the original URL', async remember => {
    const { user, alias, password, button, presenterSpy } = setup('/story/@test');
    await user.type(alias, '@test');
    await user.type(password, 'secret');
    if (remember) await user.click(screen.getByRole('checkbox', { name: 'Remember me' }));
    await user.click(button);
    verify(presenterSpy.login('@test', 'secret', remember, '/story/@test')).once();
  });
});
