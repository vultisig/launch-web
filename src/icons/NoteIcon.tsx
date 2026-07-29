import { FC, SVGProps } from "react";

export const NoteIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
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
    <rect height="14" rx="2" width="20" x="2" y="5" />
    <path d="M7 10H17M7 14H13" />
  </svg>
);
