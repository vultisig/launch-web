import { FC, SVGProps } from "react";

export const MessageSmileIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    fill="none"
    height="1em"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1.5"
    viewBox="0 0 24 24"
    width="1em"
    {...props}
  >
    <path d="M21 12C21 16.97 16.97 21 12 21C10.84 21 9.73 20.78 8.71 20.38L3 21L4.05 16.19C3.38 14.94 3 13.51 3 12C3 7.03 7.03 3 12 3C16.97 3 21 7.03 21 12Z" />
    <path d="M9 13.5C9.79 14.42 10.83 15 12 15C13.17 15 14.21 14.42 15 13.5" />
  </svg>
);
