import { useContext } from "react";
import { ToastActionsContext } from "../components/toaster/ToastContexts";

export default function useMessageActions() {
  return useContext(ToastActionsContext);
}
