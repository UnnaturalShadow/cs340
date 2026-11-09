import useUserInfoActions from "../../hooks/useUserInfoActions";
import useMessageActions from "../../hooks/useMessageActions";
import useUserInfo from "../../hooks/useUserInfo";
import "./AppNavbar.css";

import { Container, Nav, Navbar } from "react-bootstrap";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import Image from "react-bootstrap/Image";
import { useState } from "react";
import { AppNavbarPresenter } from "../../presenter/AppNavbarPresenter";
import { ToastType } from "../toaster/Toast";

const AppNavbar = () => {
  const location = useLocation();
  const { authToken, displayedUser } = useUserInfo();
  const { clearUserInfo } = useUserInfoActions();
  const navigate = useNavigate();
  const { displayToast, deleteToast } = useMessageActions();

  const [presenter] = useState(() => new AppNavbarPresenter({
    setIsLoading: () => {},
    displayInfo: (message, duration) => displayToast(ToastType.Info, message, duration),
    displayError: message => { displayToast(ToastType.Error, message, 0); },
    deleteMessage: deleteToast,
    clearUserInfo,
    navigateToLogin: () => navigate("/login"),
  }));
  const logOut = () => { if (authToken) void presenter.logout(authToken); };

  return (
    <Navbar
      collapseOnSelect
      className="mb-4"
      expand="md"
      bg="primary"
      variant="dark"
    >
      <Container>
        <Navbar.Brand>
          <div className="d-flex flex-row">
            <div className="p-2">
              <NavLink className="brand-link" to="/">
                <Image src={"/bird-white-32.png"} alt="" />
              </NavLink>
            </div>
            <div id="brand-title" className="p-3">
              <NavLink className="brand-link" to="/">
                <b>Tweeter</b>
              </NavLink>
            </div>
          </div>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="ml-auto">
            {[
              ["feed", "Feed"], ["story", "Story"],
              ["followees", "Followees"], ["followers", "Followers"],
            ].map(([route, label]) => (
              <Nav.Item key={route}>
                <NavLink
                  to={`/${route}/${displayedUser!.alias}`}
                  className={() => location.pathname.startsWith(`/${route}/`) ? "nav-link active" : "nav-link"}
                >
                  {label}
                </NavLink>
              </Nav.Item>
            ))}
            <Nav.Item>
              <NavLink
                id="logout"
                onClick={logOut}
                to={location.pathname}
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                Logout
              </NavLink>
            </Nav.Item>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
