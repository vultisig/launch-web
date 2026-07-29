import { FC, SVGProps } from "react";

export const CalendarIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
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
    <rect height="16" rx="2" width="17" x="3.5" y="5" />
    <path d="M3.5 10H20.5M7.5 2.5V5.5M16.5 2.5V5.5" />
  </svg>
);
