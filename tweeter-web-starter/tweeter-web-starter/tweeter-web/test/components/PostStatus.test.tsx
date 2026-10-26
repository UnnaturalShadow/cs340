import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { instance, mock, spy, verify, when } from '@typestrong/ts-mockito';
import { AuthToken, User } from 'tweeter-shared';
import PostStatus from '../../src/components/postStatus/PostStatus';
import useUserInfo from '../../src/hooks/useUserInfo';
import { PostStatusPresenter, PostStatusView } from '../../src/presenter/PostStatusPresenter';

jest.mock('../../src/hooks/useUserInfo', () => ({ __esModule: true, default: jest.fn() }));

describe('PostStatus', () => {
  const token = new AuthToken('component-token', 123);
  const currentUser = new User('Test', 'User', '@test', 'image.png');
  const post = 'My status';

  beforeEach(() => {
    (useUserInfo as jest.Mock).mockReturnValue({ currentUser, authToken: token });
  });

  function setup() {
    const presenter = new PostStatusPresenter(instance(mock<PostStatusView>()));
    const presenterSpy = spy(presenter);
    when(presenterSpy.postStatus(post, token, currentUser)).thenResolve();
    render(<PostStatus presenterFactory={() => instance(presenterSpy)} />);
    return {
      user: userEvent.setup(), presenterSpy,
      text: screen.getByRole('textbox'),
      postButton: screen.getByRole('button', { name: 'Post Status' }),
      clearButton: screen.getByRole('button', { name: 'Clear' }),
    };
  }

  it('initially disables Post Status and Clear', () => {
    const { postButton, clearButton } = setup();
    expect(postButton).toBeDisabled();
    expect(clearButton).toBeDisabled();
  });

  it('enables both buttons when text is entered', async () => {
    const { user, text, postButton, clearButton } = setup();
    await user.type(text, post);
    expect(postButton).toBeEnabled();
    expect(clearButton).toBeEnabled();
  });

  it('disables both buttons when the text is erased', async () => {
    const { user, text, postButton, clearButton } = setup();
    await user.type(text, post);
    await user.clear(text);
    expect(postButton).toBeDisabled();
    expect(clearButton).toBeDisabled();
  });

  it('clears the text and disables both buttons when Clear is clicked', async () => {
    const { user, text, postButton, clearButton } = setup();
    await user.type(text, post);
    await user.click(clearButton);
    expect(text).toHaveValue('');
    expect(postButton).toBeDisabled();
    expect(clearButton).toBeDisabled();
  });

  it('calls the presenter with the exact draft, auth token, and current user', async () => {
    const { user, text, postButton, presenterSpy } = setup();
    await user.type(text, post);
    await user.click(postButton);
    verify(presenterSpy.postStatus(post, token, currentUser)).once();
  });
});
