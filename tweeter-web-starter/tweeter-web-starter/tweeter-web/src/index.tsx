import "./index.css";
import { createRoot } from "react-dom/client";
import App from "./App";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faGoogle, faFacebook, faTwitter, faLinkedin, faGithub } from "@fortawesome/free-brands-svg-icons";
import UserInfoProvider from "./components/userInfo/UserInfoProvider";
import ToastInfoProvider from "./components/toaster/ToastInfoProvider";

library.add(faGoogle, faFacebook, faTwitter, faLinkedin, faGithub);

const container = document.getElementById("root")!;
const root = createRoot(container);

root.render(
  <UserInfoProvider>
    <ToastInfoProvider>
      <App />
    </ToastInfoProvider>
  </UserInfoProvider>
);
