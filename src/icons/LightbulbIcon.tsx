import { FC, SVGProps } from "react";

export const LightbulbIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M9.5 18.5C9.5 17 9 16 8 15C6.5 13.8 5.5 12 5.5 10C5.5 6.41 8.41 3.5 12 3.5C15.59 3.5 18.5 6.41 18.5 10C18.5 12 17.5 13.8 16 15C15 16 14.5 17 14.5 18.5" />
    <path d="M9.5 21.5H14.5" />
  </svg>
);
