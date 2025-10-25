import { FC, SVGProps } from "react";

export const ArrowRightToLineIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M17 12H3M17 12L11 18M17 12L11 6M21 5V19" />
  </svg>
);
