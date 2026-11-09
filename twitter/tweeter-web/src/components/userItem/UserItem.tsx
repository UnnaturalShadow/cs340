import { User } from "tweeter-shared";
import UserItemLayout from "./UserItemLayout";

interface Props {
  user: User;
  featurePath: string;
}

const UserItem = (props: Props) => <UserItemLayout {...props} />;

export default UserItem;
