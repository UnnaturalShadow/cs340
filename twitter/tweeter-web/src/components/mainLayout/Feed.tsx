import { Status } from "tweeter-shared";
import { FeedPresenter } from "../../presenter/FeedPresenter";
import StatusItem from "../statusItem/StatusItem";
import ItemScroller from "./ItemScroller";

const Feed = () => (
  <ItemScroller<Status>
    presenterFactory={view => new FeedPresenter(view)}
    itemComponentGenerator={item => <StatusItem status={item} featurePath="/feed" />}
    itemKey={(_, index) => index}
  />
);

export default Feed;
