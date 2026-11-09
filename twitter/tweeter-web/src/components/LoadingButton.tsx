import { ButtonHTMLAttributes } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading: boolean;
}

// Component reuse: props select the spinner or label for all loading buttons.
const LoadingButton = ({ isLoading, children, ...buttonProps }: Props) => (
  <button {...buttonProps}>
    {isLoading ? (
      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
    ) : <div>{children}</div>}
  </button>
);

export default LoadingButton;
