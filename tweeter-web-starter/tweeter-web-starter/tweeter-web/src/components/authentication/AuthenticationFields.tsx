import { KeyboardEventHandler } from "react";

interface Props {
  setAlias: (alias: string) => void;
  setPassword: (password: string) => void;
  onKeyDown: KeyboardEventHandler<HTMLInputElement>;
  passwordIsLast?: boolean;
}

const AuthenticationFields = ({ setAlias, setPassword, onKeyDown, passwordIsLast = false }: Props) => (
  <>
    <div className="form-floating">
      <input type="text" className="form-control" size={50} id="aliasInput"
        placeholder="name@example.com" onKeyDown={onKeyDown}
        onChange={(event) => setAlias(event.target.value)} />
      <label htmlFor="aliasInput">Alias</label>
    </div>
    <div className={`form-floating${passwordIsLast ? " mb-3" : ""}`}>
      <input type="password" className={`form-control${passwordIsLast ? " bottom" : ""}`}
        id="passwordInput" placeholder="Password" onKeyDown={onKeyDown}
        onChange={(event) => setPassword(event.target.value)} />
      <label htmlFor="passwordInput">Password</label>
    </div>
  </>
);

export default AuthenticationFields;
