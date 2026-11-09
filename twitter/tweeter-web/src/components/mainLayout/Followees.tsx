import { User } from "tweeter-shared";
import { FolloweesPresenter } from "../../presenter/FolloweesPresenter";
import UserItem from "../userItem/UserItem";
import ItemScroller from "./ItemScroller";

const Followees = () => (
  <ItemScroller<User>
    presenterFactory={view => new FolloweesPresenter(view)}
    itemComponentGenerator={item => <UserItem user={item} featurePath="/followees" />}
    itemKey={user => user.alias}
  />
);

export default Followees;
