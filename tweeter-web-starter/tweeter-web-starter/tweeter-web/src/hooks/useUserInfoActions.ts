import { useContext } from "react";
import { UserInfoActionsContext } from "../components/userInfo/UserInfoContexts";

export default function useUserInfoActions() {
  return useContext(UserInfoActionsContext);
}
