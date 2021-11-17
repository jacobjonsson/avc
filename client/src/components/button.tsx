import {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  createElement,
  ReactNode,
} from "react";
import clsx from "clsx";

interface AnchorProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  as: "a";
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  as: "button";
}

type Props = (AnchorProps | ButtonProps) & {
  children: ReactNode;
};

export function Button({as = "button", className, ...rest}: Props) {
  return createElement(as, {
    className: clsx(
      "inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
      className
    ),
    ...rest,
  });
}
