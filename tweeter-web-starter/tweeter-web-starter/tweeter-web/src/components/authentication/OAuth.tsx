import { useState } from "react";
import { OAuthPresenter } from "../../presenter/ActionsPresenter";
import useMessageActions from "../../hooks/useMessageActions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

import { ToastType } from "../toaster/Toast";

const OAuth = ({ heading }: { heading: string }) => {
  const { displayToast } = useMessageActions();

  const displayInfoMessageWithDarkBackground = (message: string): void => {
    displayToast(
      ToastType.Info,
      message,
      3000,
      undefined,
      "text-white bg-primary"
    );
  };

  const [presenter] = useState(() => new OAuthPresenter({ displayInfo: displayInfoMessageWithDarkBackground }));

  return (<>
          <h1 className="h4 mb-3 fw-normal">Or</h1>
          <h1 className="h5 mb-3 fw-normal">{heading}</h1>

          <div className="text-center mb-3">
            <button
              type="button"
              className="btn btn-link btn-floating mx-1"
              onClick={() =>
                presenter.select("Google")
              }
            >
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip id="googleTooltip">Google</Tooltip>}
              >
                <FontAwesomeIcon icon={["fab", "google"]} />
              </OverlayTrigger>
            </button>

            <button
              type="button"
              className="btn btn-link btn-floating mx-1"
              onClick={() =>
                presenter.select("Facebook")
              }
            >
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip id="facebookTooltip">Facebook</Tooltip>}
              >
                <FontAwesomeIcon icon={["fab", "facebook"]} />
              </OverlayTrigger>
            </button>

            <button
              type="button"
              className="btn btn-link btn-floating mx-1"
              onClick={() =>
                presenter.select("Twitter")
              }
            >
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip id="twitterTooltip">Twitter</Tooltip>}
              >
                <FontAwesomeIcon icon={["fab", "twitter"]} />
              </OverlayTrigger>
            </button>

            <button
              type="button"
              className="btn btn-link btn-floating mx-1"
              onClick={() =>
                presenter.select("LinkedIn")
              }
            >
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip id="linkedInTooltip">LinkedIn</Tooltip>}
              >
                <FontAwesomeIcon icon={["fab", "linkedin"]} />
              </OverlayTrigger>
            </button>

            <button
              type="button"
              className="btn btn-link btn-floating mx-1"
              onClick={() =>
                presenter.select("Github")
              }
            >
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip id="githubTooltip">GitHub</Tooltip>}
              >
                <FontAwesomeIcon icon={["fab", "github"]} />
              </OverlayTrigger>
            </button>
          </div>

</>);
};

export default OAuth;
