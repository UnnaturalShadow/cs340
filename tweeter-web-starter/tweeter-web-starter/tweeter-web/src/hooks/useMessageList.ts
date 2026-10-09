import { useContext } from "react";
import { ToastListContext } from "../components/toaster/ToastContexts";

export default function useMessageList() {
  return useContext(ToastListContext);
}
