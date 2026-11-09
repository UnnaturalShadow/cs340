import { anything, capture, instance, mock, spy, verify, when } from '@typestrong/ts-mockito';
import { AuthToken, User } from 'tweeter-shared';
import { PostStatusPresenter, PostStatusView } from '../../src/presenter/PostStatusPresenter';
import { StatusService } from '../../src/model/service/StatusService';

describe('PostStatusPresenter', () => {
  const token = new AuthToken('post-token', 123);
  const user = new User('Test', 'User', '@test', 'image.png');
  const post = 'A status with https://example.com and @friend';
  let view: PostStatusView;
  let service: StatusService;
  let presenter: PostStatusPresenter;
  let presenterSpy: PostStatusPresenter;

  // Fresh mocks, thenResolve() gives the service a successful Promise by default.
  beforeEach(() => {
    view = mock<PostStatusView>();
    service = mock(StatusService);
    when(service.postStatus(anything(), anything())).thenResolve();
    when(view.displayInfo('Posting status...', 0)).thenReturn('posting-message');
    // Run real presenter code with a mocked service, no actual posting.
    presenterSpy = spy(new PostStatusPresenter(instance(view)));
    presenter = instance(presenterSpy);
    when(presenterSpy.service).thenReturn(instance(service));
  });

  it('tells the view to display a posting status message', async () => {
    await presenter.postStatus(post, token, user);
    verify(view.displayInfo('Posting status...', 0)).once();
  });

  it('passes the supplied token and a status containing the exact text, user, and current timestamp', async () => {
    const start = Date.now();
    await presenter.postStatus(post, token, user);
    verify(service.postStatus(token, anything())).once();
    // Capture the constructed Status, check its fields instead of object identity.
    const [actualToken, status] = capture(service.postStatus).last();
    expect(actualToken).toBe(token);
    expect(status.post).toBe(post);
    expect(status.user).toBe(user);
    // Timestamp should fall within this call, no hard-coded clock value.
    expect(status.timestamp).toBeGreaterThanOrEqual(start);
    expect(status.timestamp).toBeLessThanOrEqual(Date.now());
  });

  it('on success deletes the progress message, clears the draft, and displays confirmation', async () => {
    await presenter.postStatus(post, token, user);
    // Same toast ID returned during setup, once() checks exactly one call.
    verify(view.deleteMessage('posting-message')).once();
    verify(view.setPost('')).once();
    verify(view.displayInfo('Status posted!', 2000)).once();
    verify(view.displayError(anything())).never();
    verify(view.setIsLoading(false)).once();
  });

  // thenReject() exercises the catch path; keep the draft, remove the progress toast.
  it('on failure deletes the progress message and reports the reason while preserving the draft', async () => {
    when(service.postStatus(anything(), anything())).thenReject(new Error('posting unavailable'));
    await presenter.postStatus(post, token, user);
    verify(view.deleteMessage('posting-message')).once();
    verify(view.displayError('Failed to post status: Error: posting unavailable')).once();
    verify(view.setPost(anything())).never();
    verify(view.displayInfo('Status posted!', anything())).never();
    verify(view.setIsLoading(false)).once();
  });
});
