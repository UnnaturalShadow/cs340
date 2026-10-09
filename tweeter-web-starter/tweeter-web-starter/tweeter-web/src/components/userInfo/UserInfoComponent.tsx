import useUserNavigation from "../../hooks/useUserNavigation";

import useMessageActions from "../../hooks/useMessageActions";
import useUserInfo from "../../hooks/useUserInfo";
import "./UserInfoComponent.css";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { UserInfoPresenter } from "../../presenter/ActionsPresenter";
import { ToastType } from "../toaster/Toast";

const UserInfo = () => {
  const [isFollower, setIsFollower] = useState(false);
  const [followeeCount, setFolloweeCount] = useState(-1);
  const [followerCount, setFollowerCount] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);

  const { displayToast, deleteToast } = useMessageActions();

  const { currentUser, authToken, displayedUser } = useUserInfo();

  const { navigateToUser } = useUserNavigation();


  const [presenter] = useState(() => new UserInfoPresenter({
    setIsLoading, setIsFollower, setFollowerCount, setFolloweeCount,
    displayInfo: (message, duration) => displayToast(ToastType.Info, message, duration),
    displayError: message => { displayToast(ToastType.Error, message, 0); },
    deleteMessage: deleteToast,
  }));
  useEffect(() => {
    if (authToken && currentUser && displayedUser) void presenter.load(authToken, currentUser, displayedUser);
    return () => presenter.cancel();
  }, [presenter, authToken, currentUser, displayedUser]);
  const followDisplayedUser = (event: React.MouseEvent) => {
    event.preventDefault(); if (authToken && displayedUser) void presenter.changeFollow(authToken, displayedUser, true);
  };
  const unfollowDisplayedUser = (event: React.MouseEvent) => {
    event.preventDefault(); if (authToken && displayedUser) void presenter.changeFollow(authToken, displayedUser, false);
  };

  return (
    <>
      {currentUser === null || displayedUser === null || authToken === null ? (
        <></>
      ) : (
        <div className="container">
          <div className="row">
            <div className="col-auto p-3">
              <img
                src={displayedUser.imageUrl}
                className="img-fluid"
                width="100"
                alt="Posting user"
              />
            </div>
            <div className="col p-3">
              {!displayedUser.equals(currentUser) && (
                <p id="returnToLoggedInUser">
                  Return to{" "}
                  <Link
                    to={`./${currentUser.alias}`}
                    onClick={(event) => navigateToUser(event, currentUser)}
                  >
                    logged in user
                  </Link>
                </p>
              )}
              <h2>
                <b>{displayedUser.name}</b>
              </h2>
              <h3>{displayedUser.alias}</h3>
              <br />
              {followeeCount > -1 && followerCount > -1 && (
                <div>
                  Followees: {followeeCount} Followers: {followerCount}
                </div>
              )}
            </div>
            <form>
              {!displayedUser.equals(currentUser) && (
                <div className="form-group">
                  {isFollower ? (
                    <button
                      id="unFollowButton"
                      className="btn btn-md btn-secondary me-1"
                      type="submit"
                      style={{ width: "6em" }}
                      disabled={isLoading}
                      onClick={unfollowDisplayedUser}
                    >
                      {isLoading ? (
                        <span
                          className="spinner-border spinner-border-sm"
                          role="status"
                          aria-hidden="true"
                        ></span>
                      ) : (
                        <div>Unfollow</div>
                      )}
                    </button>
                  ) : (
                    <button
                      id="followButton"
                      className="btn btn-md btn-primary me-1"
                      type="submit"
                      style={{ width: "6em" }}
                      disabled={isLoading}
                      onClick={followDisplayedUser}
                    >
                      {isLoading ? (
                        <span
                          className="spinner-border spinner-border-sm"
                          role="status"
                          aria-hidden="true"
                        ></span>
                      ) : (
                        <div>Follow</div>
                      )}
                    </button>
                  )}
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default UserInfo;
