import type { DetailedHTMLProps, LabelHTMLAttributes, PropsWithChildren } from "react";

type LabelProps = DetailedHTMLProps<LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>;

export function Label({ children, ...props }: PropsWithChildren<LabelProps>) {
  return <label {...props}>{children}</label>;
}

