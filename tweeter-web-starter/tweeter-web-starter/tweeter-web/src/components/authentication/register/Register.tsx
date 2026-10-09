import { RegisterPresenter } from "../../../presenter/AuthenticationPresenter";
import AuthenticationFields from "../AuthenticationFields";
import useUserInfoActions from "../../../hooks/useUserInfoActions";
import useMessageActions from "../../../hooks/useMessageActions";
import "./Register.css";
import "bootstrap/dist/css/bootstrap.css";

import { ChangeEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthenticationFormLayout from "../AuthenticationFormLayout";


import { ToastType } from "../../toaster/Toast";

const Register = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [alias, setAlias] = useState("");
  const [password, setPassword] = useState("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { updateUserInfo } = useUserInfoActions();
  const { displayToast } = useMessageActions();


  const [presenter] = useState(() => new RegisterPresenter({
    setIsLoading,
    displayError: message => { displayToast(ToastType.Error, message, 0); },
    authenticated: (user, token, remember, path) => {
      updateUserInfo(user, user, token, remember); navigate(path);
    },
    imageSelected: setImageUrl,
  }));
  const checkSubmitButtonStatus = () => isLoading || presenter.isDisabled(firstName, lastName, alias, password);
  const registerOnEnter = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter") { event.preventDefault(); void doRegister(); }
  };
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    void presenter.selectImage(event.target.files?.[0]);
  };
  const doRegister = () => presenter.register(firstName, lastName, alias, password, rememberMe);

  const inputFieldFactory = () => {
    return (
      <>
        <div className="form-floating">
          <input
            type="text"
            className="form-control"
            size={50}
            id="firstNameInput"
            placeholder="First Name"
            onKeyDown={registerOnEnter}
            onChange={(event) => setFirstName(event.target.value)}
          />
          <label htmlFor="firstNameInput">First Name</label>
        </div>
        <div className="form-floating">
          <input
            type="text"
            className="form-control"
            size={50}
            id="lastNameInput"
            placeholder="Last Name"
            onKeyDown={registerOnEnter}
            onChange={(event) => setLastName(event.target.value)}
          />
          <label htmlFor="lastNameInput">Last Name</label>
        </div>
        <AuthenticationFields setAlias={setAlias} setPassword={setPassword} onKeyDown={registerOnEnter} />
        <div className="form-floating mb-3">
          <input
            type="file"
            className="d-inline-block py-5 px-4 form-control bottom"
            id="imageFileInput"
            onKeyDown={registerOnEnter}
            onChange={handleFileChange}
          />
          {imageUrl.length > 0 && (
            <>
              <label htmlFor="imageFileInput">User Image</label>
              <img src={imageUrl} className="img-thumbnail" alt=""></img>
            </>
          )}
        </div>
      </>
    );
  };

  const switchAuthenticationMethodFactory = () => {
    return (
      <div className="mb-3">
        Already registered? <Link to="/login">Sign in</Link>
      </div>
    );
  };

  return (
    <AuthenticationFormLayout
      headingText="Please Register"
      submitButtonLabel="Register"
      oAuthHeading="Register with:"
      inputFieldFactory={inputFieldFactory}
      switchAuthenticationMethodFactory={switchAuthenticationMethodFactory}
      setRememberMe={setRememberMe}
      submitButtonDisabled={checkSubmitButtonStatus}
      isLoading={isLoading}
      submit={doRegister}
    />
  );
};

export default Register;
