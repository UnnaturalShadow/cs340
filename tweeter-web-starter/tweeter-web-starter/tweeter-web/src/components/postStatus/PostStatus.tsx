import useMessageActions from "../../hooks/useMessageActions";
import useUserInfo from "../../hooks/useUserInfo";
import "./PostStatus.css";
import { useState } from "react";

import { PostStatusPresenter } from "../../presenter/ActionsPresenter";
import { ToastType } from "../toaster/Toast";

const PostStatus = () => {
  const { displayToast, deleteToast } = useMessageActions();

  const { currentUser, authToken } = useUserInfo();
  const [post, setPost] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [presenter] = useState(() => new PostStatusPresenter({
    setIsLoading, setPost,
    displayInfo: (message, duration) => displayToast(ToastType.Info, message, duration),
    displayError: message => { displayToast(ToastType.Error, message, 0); },
    deleteMessage: deleteToast,
  }));
  const submitPost = (event: React.MouseEvent) => {
    event.preventDefault(); void presenter.submit(post, authToken, currentUser);
  };
  const clearPost = (event: React.MouseEvent) => { event.preventDefault(); setPost(""); };
  const checkButtonStatus = () => isLoading || presenter.isDisabled(post, authToken, currentUser);

  return (
    <form>
      <div className="form-group mb-3">
        <textarea
          className="form-control"
          id="postStatusTextArea"
          rows={10}
          placeholder="What's on your mind?"
          value={post}
          onChange={(event) => {
            setPost(event.target.value);
          }}
        />
      </div>
      <div className="form-group">
        <button
          id="postStatusButton"
          className="btn btn-md btn-primary me-1"
          type="button"
          disabled={checkButtonStatus()}
          style={{ width: "8em" }}
          onClick={submitPost}
        >
          {isLoading ? (
            <span
              className="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            ></span>
          ) : (
            <div>Post Status</div>
          )}
        </button>
        <button
          id="clearStatusButton"
          className="btn btn-md btn-secondary"
          type="button"
          disabled={checkButtonStatus()}
          onClick={clearPost}
        >
          Clear
        </button>
      </div>
    </form>
  );
};

export default PostStatus;
