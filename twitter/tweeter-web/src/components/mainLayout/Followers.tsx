import { User } from "tweeter-shared";
import { FollowersPresenter } from "../../presenter/FollowersPresenter";
import UserItem from "../userItem/UserItem";
import ItemScroller from "./ItemScroller";

const Followers = () => (
  <ItemScroller<User>
    presenterFactory={view => new FollowersPresenter(view)}
    itemComponentGenerator={item => <UserItem user={item} featurePath="/followers" />}
    itemKey={user => user.alias}
  />
);

export default Followers;
