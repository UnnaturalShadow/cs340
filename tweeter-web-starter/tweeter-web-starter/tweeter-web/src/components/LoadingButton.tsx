import { ButtonHTMLAttributes } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading: boolean;
}

// Shared button spinner and label.
const LoadingButton = ({ isLoading, children, ...buttonProps }: Props) => (
  <button {...buttonProps}>
    {isLoading ? (
      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
    ) : <div>{children}</div>}
  </button>
);

export default LoadingButton;
