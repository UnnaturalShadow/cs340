import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { User } from "tweeter-shared";
import useUserNavigation from "../../hooks/useUserNavigation";

interface Props {
  user: User;
  featurePath: string;
  children?: ReactNode;
}

// Shared user/status row layout.
const UserItemLayout = ({ user, featurePath, children }: Props) => {
  const { navigateToUser } = useUserNavigation();
  return (
    <div className="col bg-light mx-0 px-0">
      <div className="container px-0">
        <div className="row mx-0 px-0">
          <div className="col-auto p-3">
            <img src={user.imageUrl} className="img-fluid" width="80" alt="Posting user" />
          </div>
          <div className="col">
            <h2>
              <b>{user.firstName} {user.lastName}</b>{" "}-{" "}
              <Link to={`${featurePath}/${user.alias}`} onClick={navigateToUser}>{user.alias}</Link>
            </h2>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserItemLayout;
