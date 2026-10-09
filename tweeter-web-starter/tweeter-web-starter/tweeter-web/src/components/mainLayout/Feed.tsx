import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { Status } from "tweeter-shared";
import StatusItem from "../statusItem/StatusItem";
import { ToastType } from "../toaster/Toast";
import useMessageActions from "../../hooks/useMessageActions";
import useUserInfo from "../../hooks/useUserInfo";

import { FeedPresenter } from "../../presenter/ScrollerPresenter";

const Feed = () => {
  const featurePath = "/feed";
  const { displayedUser, authToken } = useUserInfo();
  const { displayToast } = useMessageActions();
  const [items, setItems] = useState<Status[]>([]);
  const [hasMoreItems, setHasMoreItems] = useState(true);

  const [presenter] = useState(() => new FeedPresenter({
    setItems, setHasMoreItems,
    displayError: message => { displayToast(ToastType.Error, message, 0); },
  }));
  useEffect(() => {
    presenter.reset(authToken, displayedUser);
    return () => presenter.cancel();
  }, [presenter, authToken, displayedUser]);

  return (
    <div className="container px-0 overflow-visible vh-100">
      <InfiniteScroll className="pr-0 mr-0" dataLength={items.length}
        next={() => { void presenter.loadMore(); }}
        hasMore={hasMoreItems} loader={<h4>Loading...</h4>}>
        {items.map((item, index) => (
          <div key={index} className="row mb-3 mx-0 px-0 border rounded bg-white">
            <StatusItem status={item} featurePath={featurePath} />
          </div>
        ))}
      </InfiniteScroll>
    </div>
  );
};

export default Feed;
