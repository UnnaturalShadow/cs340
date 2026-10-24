import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthToken, User } from 'tweeter-shared';
import AppNavbar from '../../src/components/appNavbar/AppNavbar';
import { UserInfoContext, UserInfoActionsContext } from '../../src/components/userInfo/UserInfoContexts';
import { ToastActionsContext } from '../../src/components/toaster/ToastContexts';
import { UserService } from '../../src/model/service/UserService';

describe('AppNavbar logout view effects', () => {
  afterEach(() => jest.restoreAllMocks());

  function setup() {
    const user = new User('Test', 'User', '@test', 'image.png');
    const token = new AuthToken('navbar-token', 123);
    const clearUserInfo = jest.fn();
    const deleteToast = jest.fn();
    const displayToast = jest.fn(() => 'logout-message');
    render(
      <UserInfoContext.Provider value={{ currentUser: user, displayedUser: user, authToken: token }}>
        <UserInfoActionsContext.Provider value={{ clearUserInfo, updateUserInfo: jest.fn(), setDisplayedUser: jest.fn() }}>
          <ToastActionsContext.Provider value={{ displayToast, deleteToast, displayExistingToast: jest.fn(), deleteAllToasts: jest.fn() }}>
            <MemoryRouter initialEntries={['/feed/@test']}>
              <Routes>
                <Route path="/feed/:alias" element={<AppNavbar />} />
                <Route path="/login" element={<h1>Login destination</h1>} />
              </Routes>
            </MemoryRouter>
          </ToastActionsContext.Provider>
        </UserInfoActionsContext.Provider>
      </UserInfoContext.Provider>,
    );
    return { clearUserInfo, deleteToast, displayToast, token };
  }

  it('clears user info and navigates to /login after successful logout', async () => {
    const logout = jest.spyOn(UserService.prototype, 'logout').mockResolvedValue();
    const { clearUserInfo, deleteToast, token } = setup();
    await userEvent.setup().click(screen.getByRole('link', { name: 'Logout' }));
    expect(await screen.findByRole('heading', { name: 'Login destination' })).toBeInTheDocument();
    expect(logout).toHaveBeenCalledWith(token);
    expect(clearUserInfo).toHaveBeenCalledTimes(1);
    expect(deleteToast).toHaveBeenCalledWith('logout-message');
  });

  it('keeps user info, the current route, and progress toast when logout fails', async () => {
    jest.spyOn(UserService.prototype, 'logout').mockRejectedValue(new Error('offline'));
    const { clearUserInfo, deleteToast, displayToast } = setup();
    await userEvent.setup().click(screen.getByRole('link', { name: 'Logout' }));
    await waitFor(() => expect(displayToast).toHaveBeenCalledWith(expect.anything(), 'Failed to log out: Error: offline', 0));
    expect(clearUserInfo).not.toHaveBeenCalled();
    expect(deleteToast).not.toHaveBeenCalled();
    expect(screen.getByRole('link', { name: 'Logout' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Login destination' })).not.toBeInTheDocument();
  });
});
