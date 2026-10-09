import { useContext } from "react";
import { UserInfoContext } from "../components/userInfo/UserInfoContexts";

export default function useUserInfo() {
  return useContext(UserInfoContext);
}
