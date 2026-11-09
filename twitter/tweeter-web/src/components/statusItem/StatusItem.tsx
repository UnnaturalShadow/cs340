import { Status } from "tweeter-shared";
import UserItemLayout from "../userItem/UserItemLayout";
import Post from "./Post";

interface Props { status: Status; featurePath: string; }

const StatusItem = ({ status, featurePath }: Props) => (
  <UserItemLayout user={status.user} featurePath={featurePath}>
    {status.formattedDate}<br />
    <Post status={status} featurePath={featurePath} />
  </UserItemLayout>
);

export default StatusItem;
