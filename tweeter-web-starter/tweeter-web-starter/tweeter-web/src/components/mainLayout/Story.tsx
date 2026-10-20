import { Status } from "tweeter-shared";
import { StoryPresenter } from "../../presenter/StoryPresenter";
import StatusItem from "../statusItem/StatusItem";
import ItemScroller from "./ItemScroller";

const Story = () => (
  <ItemScroller<Status>
    presenterFactory={view => new StoryPresenter(view)}
    itemComponentGenerator={item => <StatusItem status={item} featurePath="/story" />}
    itemKey={(_, index) => index}
  />
);

export default Story;
