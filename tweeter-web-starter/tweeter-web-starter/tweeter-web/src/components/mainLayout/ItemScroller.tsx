import { Key, useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { PagedPresenter, PagedPresenterView } from "../../presenter/PagedPresenter";
import useMessageActions from "../../hooks/useMessageActions";
import useUserInfo from "../../hooks/useUserInfo";
import { ToastType } from "../toaster/Toast";

interface Props<T> {
  presenterFactory(view: PagedPresenterView<T>): Pick<PagedPresenter<T, unknown>, "reset" | "cancel" | "loadMoreItems">;
  itemComponentGenerator(item: T): JSX.Element;
  itemKey(item: T, index: number): Key;
}

// Shared scrolling UI for users and statuses.
const ItemScroller = <T,>({ presenterFactory, itemComponentGenerator, itemKey }: Props<T>) => {
  const { displayedUser, authToken } = useUserInfo();
  const { displayToast } = useMessageActions();
  const [items, setItems] = useState<T[]>([]);
  const [hasMoreItems, setHasMoreItems] = useState(true);
  const [presenter] = useState(() => presenterFactory({
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
        next={() => { if (authToken && displayedUser) void presenter.loadMoreItems(authToken, displayedUser); }}
        hasMore={hasMoreItems} loader={<h4>Loading...</h4>}>
        {items.map((item, index) => (
          <div key={itemKey(item, index)} className="row mb-3 mx-0 px-0 border rounded bg-white">
            {itemComponentGenerator(item)}
          </div>
        ))}
      </InfiniteScroll>
    </div>
  );
};

export default ItemScroller;
