import { FC, SVGProps } from "react";

export const ArrowDownUpIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M3 16L7 20M7 20L11 16M7 20V4M21 8L17 4M17 4L13 8M17 4V20" />
  </svg>
);
