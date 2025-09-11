import type { ButtonHTMLAttributes, DetailedHTMLProps, PropsWithChildren } from "react";

type ButtonProps = DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;

export function Button({ children, ...props }: PropsWithChildren<ButtonProps>) {
  return (
    <button {...props}>
      {children}
    </button>
  );
}

