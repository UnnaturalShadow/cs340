import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { User } from "tweeter-shared";
import UserItem from "../userItem/UserItem";
import { ToastType } from "../toaster/Toast";
import useMessageActions from "../../hooks/useMessageActions";
import useUserInfo from "../../hooks/useUserInfo";

import { FolloweesPresenter } from "../../presenter/ScrollerPresenter";

const Followees = () => {
  const featurePath = "/followees";
  const { displayedUser, authToken } = useUserInfo();
  const { displayToast } = useMessageActions();
  const [items, setItems] = useState<User[]>([]);
  const [hasMoreItems, setHasMoreItems] = useState(true);

  const [presenter] = useState(() => new FolloweesPresenter({
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
        {items.map((item) => (
          <div key={item.alias} className="row mb-3 mx-0 px-0 border rounded bg-white">
            <UserItem user={item} featurePath={featurePath} />
          </div>
        ))}
      </InfiniteScroll>
    </div>
  );
};

export default Followees;
