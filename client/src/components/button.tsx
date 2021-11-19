import {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  createElement,
  ReactNode,
} from "react";
import clsx from "clsx";

interface AnchorProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  as?: "a";
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  as?: "button";
}

type Props = (AnchorProps | ButtonProps) & {
  children: ReactNode;
  variant?: "primary" | "secondary";
};

export function Button({
  as = "button",
  variant = "primary",
  className,
  ...rest
}: Props) {
  return createElement(as, {
    className: clsx(
      variant === "primary" &&
        "inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
      variant === "secondary" &&
        "inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500",
      className
    ),
    ...rest,
  });
}
