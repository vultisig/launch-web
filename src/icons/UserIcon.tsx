import { FC, SVGProps } from "react";

export const UserIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
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
    <circle cx="12" cy="7" r="3.5" />
    <path d="M5 20C5 16.7 8 14.5 12 14.5C16 14.5 19 16.7 19 20" />
  </svg>
);
