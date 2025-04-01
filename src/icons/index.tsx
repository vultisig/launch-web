import { FC, SVGProps } from "react";

export const ArrowDown: FC<SVGProps<SVGSVGElement>> = ({
  fill = "none",
  height = 24,
  stroke = "white",
  strokeLinecap = "round",
  strokeLinejoin = "round",
  strokeWidth = 2,
  width = 24,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    {...{
      ...props,
      fill,
      height,
      stroke,
      strokeLinecap,
      strokeLinejoin,
      strokeWidth,
      width,
    }}
  >
    <path d="M12 5V19M12 19L19 12M12 19L5 12" />
  </svg>
);

export const ArrowDownUp: FC<SVGProps<SVGSVGElement>> = ({
  fill = "none",
  height = 24,
  stroke = "white",
  strokeLinecap = "round",
  strokeLinejoin = "round",
  strokeWidth = 2,
  width = 24,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    {...{
      ...props,
      fill,
      height,
      stroke,
      strokeLinecap,
      strokeLinejoin,
      strokeWidth,
      width,
    }}
  >
    <path d="M3 16L7 20M7 20L11 16M7 20V4M21 8L17 4M17 4L13 8M17 4V20" />
  </svg>
);

export const ArrowRightToLine: FC<SVGProps<SVGSVGElement>> = ({
  fill = "none",
  height = 24,
  stroke = "white",
  strokeLinecap = "round",
  strokeLinejoin = "round",
  strokeWidth = 2,
  width = 24,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    {...{
      ...props,
      fill,
      height,
      stroke,
      strokeLinecap,
      strokeLinejoin,
      strokeWidth,
      width,
    }}
  >
    <path d="M17 12H3M17 12L11 18M17 12L11 6M21 5V19" />
  </svg>
);

export const CarFront: FC<SVGProps<SVGSVGElement>> = ({
  fill = "none",
  height = 24,
  stroke = "white",
  strokeLinecap = "round",
  strokeLinejoin = "round",
  strokeWidth = 2,
  width = 24,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    {...{
      ...props,
      fill,
      height,
      stroke,
      strokeLinecap,
      strokeLinejoin,
      strokeWidth,
      width,
    }}
  >
    <path d="M21 8.00004L19 10M19 10L17.5 6.30004C17.3585 5.92138 17.1057 5.59446 16.7747 5.36239C16.4437 5.13032 16.0502 5.00399 15.646 5.00004H8.4C7.9925 4.99068 7.59188 5.10605 7.25177 5.3307C6.91166 5.55536 6.64832 5.87856 6.497 6.25704L5 10M19 10H5M19 10C20.1046 10 21 10.8954 21 12V16C21 17.1046 20.1046 18 19 18M5 10L3 8.00004M5 10C3.89543 10 3 10.8954 3 12V16C3 17.1046 3.89543 18 5 18M7 14H7.01M17 14H17.01M19 18H5M19 18V20M5 18V20" />
  </svg>
);

export const ChartArea: FC<SVGProps<SVGSVGElement>> = ({
  fill = "none",
  height = 24,
  stroke = "white",
  strokeLinecap = "round",
  strokeLinejoin = "round",
  strokeWidth = 2,
  width = 24,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    {...{
      ...props,
      fill,
      height,
      stroke,
      strokeLinecap,
      strokeLinejoin,
      strokeWidth,
      width,
    }}
  >
    <path d="M3 3V19C3 19.5304 3.21071 20.0391 3.58579 20.4142C3.96086 20.7893 4.46957 21 5 21H21M7 11.2069C7.00003 11.0746 7.05253 10.9476 7.146 10.8539L9.146 8.85393C9.19245 8.80736 9.24762 8.77042 9.30837 8.74521C9.36911 8.72001 9.43423 8.70703 9.5 8.70703C9.56577 8.70703 9.63089 8.72001 9.69163 8.74521C9.75238 8.77042 9.80755 8.80736 9.854 8.85393L13.146 12.1459C13.1924 12.1925 13.2476 12.2294 13.3084 12.2546C13.3691 12.2798 13.4342 12.2928 13.5 12.2928C13.5658 12.2928 13.6309 12.2798 13.6916 12.2546C13.7524 12.2294 13.8076 12.1925 13.854 12.1459L18.146 7.85393C18.2159 7.78388 18.3049 7.73614 18.402 7.71674C18.499 7.69734 18.5996 7.70716 18.691 7.74495C18.7824 7.78274 18.8606 7.84681 18.9156 7.92905C18.9706 8.01128 19 8.10799 19 8.20692V15.9999C19 16.2651 18.8946 16.5195 18.7071 16.707C18.5196 16.8946 18.2652 16.9999 18 16.9999H8C7.73478 16.9999 7.48043 16.8946 7.29289 16.707C7.10536 16.5195 7 16.2651 7 15.9999V11.2069Z" />
  </svg>
);

export const ChevronDown: FC<SVGProps<SVGSVGElement>> = ({
  fill = "none",
  height = 24,
  stroke = "white",
  strokeLinecap = "round",
  strokeLinejoin = "round",
  strokeWidth = 2,
  width = 24,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    {...{
      ...props,
      fill,
      height,
      stroke,
      strokeLinecap,
      strokeLinejoin,
      strokeWidth,
      width,
    }}
  >
    <path d="M6 9L12 15L18 9" />
  </svg>
);

export const ChevronLeft: FC<SVGProps<SVGSVGElement>> = ({
  fill = "none",
  height = 24,
  stroke = "white",
  strokeLinecap = "round",
  strokeLinejoin = "round",
  strokeWidth = 2,
  width = 24,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    {...{
      ...props,
      fill,
      height,
      stroke,
      strokeLinecap,
      strokeLinejoin,
      strokeWidth,
      width,
    }}
  >
    <path d="M15 18L9 12L15 6" />
  </svg>
);

export const ChevronRight: FC<SVGProps<SVGSVGElement>> = ({
  fill = "none",
  height = 24,
  stroke = "white",
  strokeLinecap = "round",
  strokeLinejoin = "round",
  strokeWidth = 2,
  width = 24,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    {...{
      ...props,
      fill,
      height,
      stroke,
      strokeLinecap,
      strokeLinejoin,
      strokeWidth,
      width,
    }}
  >
    <path d="M9 18L15 12L9 6" />
  </svg>
);

export const Check: FC<SVGProps<SVGSVGElement>> = ({
  fill = "none",
  height = 24,
  stroke = "white",
  strokeLinecap = "round",
  strokeLinejoin = "round",
  strokeWidth = 2,
  width = 24,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    {...{
      ...props,
      fill,
      height,
      stroke,
      strokeLinecap,
      strokeLinejoin,
      strokeWidth,
      width,
    }}
  >
    <path d="M20 6L9 17L4 12" />
  </svg>
);

export const CheckCheck: FC<SVGProps<SVGSVGElement>> = ({
  fill = "none",
  height = 24,
  stroke = "white",
  strokeLinecap = "round",
  strokeLinejoin = "round",
  strokeWidth = 2,
  width = 24,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    {...{
      ...props,
      fill,
      height,
      stroke,
      strokeLinecap,
      strokeLinejoin,
      strokeWidth,
      width,
    }}
  >
    <path d="M18 6L7 17L2 12M22 10L14.5 17.5L13 16" />
  </svg>
);

export const ChevronUp: FC<SVGProps<SVGSVGElement>> = ({
  fill = "none",
  height = 24,
  stroke = "white",
  strokeLinecap = "round",
  strokeLinejoin = "round",
  strokeWidth = 2,
  width = 24,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    {...{
      ...props,
      fill,
      height,
      stroke,
      strokeLinecap,
      strokeLinejoin,
      strokeWidth,
      width,
    }}
  >
    <path d="M18 15L12 9L6 15" />
  </svg>
);

export const CircleCheckBig: FC<SVGProps<SVGSVGElement>> = ({
  fill = "none",
  height = 24,
  stroke = "white",
  strokeLinecap = "round",
  strokeLinejoin = "round",
  strokeWidth = 2,
  width = 24,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    {...{
      ...props,
      fill,
      height,
      stroke,
      strokeLinecap,
      strokeLinejoin,
      strokeWidth,
      width,
    }}
  >
    <path d="M21.8011 9.99999C22.2578 12.2413 21.9323 14.5714 20.879 16.6018C19.8256 18.6322 18.108 20.24 16.0126 21.1573C13.9172 22.0746 11.5707 22.2458 9.3644 21.6424C7.15807 21.0389 5.22529 19.6974 3.88838 17.8414C2.55146 15.9854 1.89122 13.7272 2.01776 11.4434C2.14431 9.15952 3.04998 6.98808 4.58375 5.29116C6.11752 3.59424 8.18668 2.47442 10.4462 2.11844C12.7056 1.76247 15.0189 2.19185 17.0001 3.33499M9 11L12 14L22 4" />
  </svg>
);

export const Clock: FC<SVGProps<SVGSVGElement>> = ({
  fill = "none",
  height = 24,
  stroke = "white",
  strokeLinecap = "round",
  strokeLinejoin = "round",
  strokeWidth = 2,
  width = 24,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    {...{
      ...props,
      fill,
      height,
      stroke,
      strokeLinecap,
      strokeLinejoin,
      strokeWidth,
      width,
    }}
  >
    <path d="M12 2V6M16.2 7.7999L19.1 4.8999M18 12H22M16.2 16.2L19.1 19.1M12 18V22M4.90002 19.1L7.80002 16.2M2 12H6M4.90002 4.8999L7.80002 7.7999" />
  </svg>
);

export const Copy: FC<SVGProps<SVGSVGElement>> = ({
  fill = "none",
  height = 24,
  stroke = "white",
  strokeLinecap = "round",
  strokeLinejoin = "round",
  strokeWidth = 2,
  width = 24,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    {...{
      ...props,
      fill,
      height,
      stroke,
      strokeLinecap,
      strokeLinejoin,
      strokeWidth,
      width,
    }}
  >
    <path d="M4 16C2.9 16 2 15.1 2 14V4C2 2.9 2.9 2 4 2H14C15.1 2 16 2.9 16 4M10 8H20C21.1046 8 22 8.89543 22 10V20C22 21.1046 21.1046 22 20 22H10C8.89543 22 8 21.1046 8 20V10C8 8.89543 8.89543 8 10 8Z" />
  </svg>
);

export const Database: FC<SVGProps<SVGSVGElement>> = ({
  fill = "none",
  height = 24,
  stroke = "white",
  strokeLinecap = "round",
  strokeLinejoin = "round",
  strokeWidth = 2,
  width = 24,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    {...{
      ...props,
      fill,
      height,
      stroke,
      strokeLinecap,
      strokeLinejoin,
      strokeWidth,
      width,
    }}
  >
    <path d="M21 5C21 6.65685 16.9706 8 12 8C7.02944 8 3 6.65685 3 5M21 5C21 3.34315 16.9706 2 12 2C7.02944 2 3 3.34315 3 5M21 5V19C21 19.7956 20.0518 20.5587 18.364 21.1213C16.6761 21.6839 14.3869 22 12 22C9.61305 22 7.32387 21.6839 5.63604 21.1213C3.94821 20.5587 3 19.7956 3 19V5M3 12C3 12.7956 3.94821 13.5587 5.63604 14.1213C7.32387 14.6839 9.61305 15 12 15C14.3869 15 16.6761 14.6839 18.364 14.1213C20.0518 13.5587 21 12.7956 21 12" />
  </svg>
);

export const Hourglass: FC<SVGProps<SVGSVGElement>> = ({
  fill = "none",
  height = 24,
  stroke = "white",
  strokeLinecap = "round",
  strokeLinejoin = "round",
  strokeWidth = 2,
  width = 24,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    {...{
      ...props,
      fill,
      height,
      stroke,
      strokeLinecap,
      strokeLinejoin,
      strokeWidth,
      width,
    }}
  >
    <path d="M5 22H19M5 2H19M17 22V17.828C16.9999 17.2976 16.7891 16.789 16.414 16.414L12 12M12 12L7.586 16.414C7.2109 16.789 7.00011 17.2976 7 17.828V22M12 12L7.586 7.586C7.2109 7.21101 7.00011 6.70239 7 6.172V2M12 12L16.414 7.586C16.7891 7.21101 16.9999 6.70239 17 6.172V2" />
  </svg>
);

export const Info: FC<SVGProps<SVGSVGElement>> = ({
  fill = "none",
  height = 24,
  stroke = "white",
  strokeLinecap = "round",
  strokeLinejoin = "round",
  strokeWidth = 2,
  width = 24,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    {...{
      ...props,
      fill,
      height,
      stroke,
      strokeLinecap,
      strokeLinejoin,
      strokeWidth,
      width,
    }}
  >
    <path d="M12 16V12M12 8H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" />
  </svg>
);

export const Loader: FC<SVGProps<SVGSVGElement>> = ({
  fill = "none",
  height = 24,
  stroke = "white",
  strokeLinecap = "round",
  strokeLinejoin = "round",
  strokeWidth = 2,
  width = 24,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    {...{
      ...props,
      fill,
      height,
      stroke,
      strokeLinecap,
      strokeLinejoin,
      strokeWidth,
      width,
    }}
  >
    <path d="M12 2V6M16.2 7.7999L19.1 4.8999M18 12H22M16.2 16.2L19.1 19.1M12 18V22M4.90002 19.1L7.80002 16.2M2 12H6M4.90002 4.8999L7.80002 7.7999" />
  </svg>
);

export const OctagonAlert: FC<SVGProps<SVGSVGElement>> = ({
  fill = "none",
  height = 24,
  stroke = "white",
  strokeLinecap = "round",
  strokeLinejoin = "round",
  strokeWidth = 2,
  width = 24,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    {...{
      ...props,
      fill,
      height,
      stroke,
      strokeLinecap,
      strokeLinejoin,
      strokeWidth,
      width,
    }}
  >
    <path d="M12 16H12.01M12 8V12M15.312 2C15.8424 2.00011 16.351 2.2109 16.726 2.586L21.414 7.274C21.7891 7.64899 21.9999 8.15761 22 8.688V15.312C21.9999 15.8424 21.7891 16.351 21.414 16.726L16.726 21.414C16.351 21.7891 15.8424 21.9999 15.312 22H8.688C8.15761 21.9999 7.64899 21.7891 7.274 21.414L2.586 16.726C2.2109 16.351 2.00011 15.8424 2 15.312V8.688C2.00011 8.15761 2.2109 7.64899 2.586 7.274L7.274 2.586C7.64899 2.2109 8.15761 2.00011 8.688 2H15.312Z" />
  </svg>
);

export const Power: FC<SVGProps<SVGSVGElement>> = ({
  fill = "none",
  height = 24,
  stroke = "white",
  strokeLinecap = "round",
  strokeLinejoin = "round",
  strokeWidth = 2,
  width = 24,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    {...{
      ...props,
      fill,
      height,
      stroke,
      strokeLinecap,
      strokeLinejoin,
      strokeWidth,
      width,
    }}
  >
    <path d="M12.0002 2V12M18.4003 6.6001C19.6569 7.8572 20.5132 9.45827 20.8611 11.2014C21.209 12.9445 21.0329 14.7516 20.3551 16.3948C19.6774 18.038 18.5282 19.4437 17.0525 20.4346C15.5769 21.4255 13.8408 21.9573 12.0634 21.9628C10.2859 21.9684 8.54654 21.4475 7.06471 20.4659C5.58288 19.4842 4.42491 18.0857 3.73684 16.4468C3.04876 14.8079 2.8614 13.002 3.19837 11.2567C3.53533 9.51145 4.38155 7.90505 5.63029 6.6401" />
  </svg>
);

export const RefreshCW: FC<SVGProps<SVGSVGElement>> = ({
  fill = "none",
  height = 24,
  stroke = "white",
  strokeLinecap = "round",
  strokeLinejoin = "round",
  strokeWidth = 2,
  width = 24,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    {...{
      ...props,
      fill,
      height,
      stroke,
      strokeLinecap,
      strokeLinejoin,
      strokeWidth,
      width,
    }}
  >
    <path d="M3 12C3 9.61305 3.94821 7.32387 5.63604 5.63604C7.32387 3.94821 9.61305 3 12 3C14.516 3.00947 16.931 3.99122 18.74 5.74L21 8M21 8V3M21 8H16M21 12C21 14.3869 20.0518 16.6761 18.364 18.364C16.6761 20.0518 14.3869 21 12 21C9.48395 20.9905 7.06897 20.0088 5.26 18.26L3 16M3 16H8M3 16V21" />
  </svg>
);

export const Search: FC<SVGProps<SVGSVGElement>> = ({
  fill = "none",
  height = 24,
  stroke = "white",
  strokeLinecap = "round",
  strokeLinejoin = "round",
  strokeWidth = 2,
  width = 24,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    {...{
      ...props,
      fill,
      height,
      stroke,
      strokeLinecap,
      strokeLinejoin,
      strokeWidth,
      width,
    }}
  >
    <path d="M21 21L16.7 16.7M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" />
  </svg>
);

export const SettingsOne: FC<SVGProps<SVGSVGElement>> = ({
  fill = "none",
  height = 24,
  stroke = "white",
  strokeLinecap = "round",
  strokeLinejoin = "round",
  strokeWidth = 2,
  width = 24,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    {...{
      ...props,
      fill,
      height,
      stroke,
      strokeLinecap,
      strokeLinejoin,
      strokeWidth,
      width,
    }}
  >
    <path d="M12.22 2H11.78C11.2496 2 10.7409 2.21071 10.3658 2.58579C9.99072 2.96086 9.78 3.46957 9.78 4V4.18C9.77964 4.53073 9.68706 4.87519 9.51154 5.17884C9.33602 5.48248 9.08374 5.73464 8.78 5.91L8.35 6.16C8.04596 6.33554 7.70108 6.42795 7.35 6.42795C6.99893 6.42795 6.65404 6.33554 6.35 6.16L6.2 6.08C5.74107 5.81526 5.19584 5.74344 4.684 5.88031C4.17217 6.01717 3.73555 6.35154 3.47 6.81L3.25 7.19C2.98526 7.64893 2.91345 8.19416 3.05031 8.706C3.18717 9.21783 3.52154 9.65445 3.98 9.92L4.13 10.02C4.43228 10.1945 4.68362 10.4451 4.85905 10.7468C5.03448 11.0486 5.1279 11.391 5.13 11.74V12.25C5.1314 12.6024 5.03965 12.949 4.86405 13.2545C4.68844 13.5601 4.43521 13.8138 4.13 13.99L3.98 14.08C3.52154 14.3456 3.18717 14.7822 3.05031 15.294C2.91345 15.8058 2.98526 16.3511 3.25 16.81L3.47 17.19C3.73555 17.6485 4.17217 17.9828 4.684 18.1197C5.19584 18.2566 5.74107 18.1847 6.2 17.92L6.35 17.84C6.65404 17.6645 6.99893 17.5721 7.35 17.5721C7.70108 17.5721 8.04596 17.6645 8.35 17.84L8.78 18.09C9.08374 18.2654 9.33602 18.5175 9.51154 18.8212C9.68706 19.1248 9.77964 19.4693 9.78 19.82V20C9.78 20.5304 9.99072 21.0391 10.3658 21.4142C10.7409 21.7893 11.2496 22 11.78 22H12.22C12.7504 22 13.2591 21.7893 13.6342 21.4142C14.0093 21.0391 14.22 20.5304 14.22 20V19.82C14.2204 19.4693 14.3129 19.1248 14.4885 18.8212C14.664 18.5175 14.9163 18.2654 15.22 18.09L15.65 17.84C15.954 17.6645 16.2989 17.5721 16.65 17.5721C17.0011 17.5721 17.346 17.6645 17.65 17.84L17.8 17.92C18.2589 18.1847 18.8042 18.2566 19.316 18.1197C19.8278 17.9828 20.2645 17.6485 20.53 17.19L20.75 16.8C21.0147 16.3411 21.0866 15.7958 20.9497 15.284C20.8128 14.7722 20.4785 14.3356 20.02 14.07L19.87 13.99C19.5648 13.8138 19.3116 13.5601 19.136 13.2545C18.9604 12.949 18.8686 12.6024 18.87 12.25V11.75C18.8686 11.3976 18.9604 11.051 19.136 10.7455C19.3116 10.4399 19.5648 10.1862 19.87 10.01L20.02 9.92C20.4785 9.65445 20.8128 9.21783 20.9497 8.706C21.0866 8.19416 21.0147 7.64893 20.75 7.19L20.53 6.81C20.2645 6.35154 19.8278 6.01717 19.316 5.88031C18.8042 5.74344 18.2589 5.81526 17.8 6.08L17.65 6.16C17.346 6.33554 17.0011 6.42795 16.65 6.42795C16.2989 6.42795 15.954 6.33554 15.65 6.16L15.22 5.91C14.9163 5.73464 14.664 5.48248 14.4885 5.17884C14.3129 4.87519 14.2204 4.53073 14.22 4.18V4C14.22 3.46957 14.0093 2.96086 13.6342 2.58579C13.2591 2.21071 12.7504 2 12.22 2Z" />
    <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" />
  </svg>
);

export const SettingsTwo: FC<SVGProps<SVGSVGElement>> = ({
  fill = "none",
  height = 24,
  stroke = "white",
  strokeLinecap = "round",
  strokeLinejoin = "round",
  strokeWidth = 2,
  width = 24,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    {...{
      ...props,
      fill,
      height,
      stroke,
      strokeLinecap,
      strokeLinejoin,
      strokeWidth,
      width,
    }}
  >
    <path d="M20 7H11M14 17H5M14 17C14 18.6569 15.3431 20 17 20C18.6569 20 20 18.6569 20 17C20 15.3431 18.6569 14 17 14C15.3431 14 14 15.3431 14 17ZM10 7C10 8.65685 8.65685 10 7 10C5.34315 10 4 8.65685 4 7C4 5.34315 5.34315 4 7 4C8.65685 4 10 5.34315 10 7Z" />
  </svg>
);

export const Timer: FC<SVGProps<SVGSVGElement>> = ({
  fill = "none",
  height = 24,
  stroke = "white",
  strokeLinecap = "round",
  strokeLinejoin = "round",
  strokeWidth = 2,
  width = 24,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    {...{
      ...props,
      fill,
      height,
      stroke,
      strokeLinecap,
      strokeLinejoin,
      strokeWidth,
      width,
    }}
  >
    <path d="M10 2H14M12 14L15 11M20 14C20 18.4183 16.4183 22 12 22C7.58172 22 4 18.4183 4 14C4 9.58172 7.58172 6 12 6C16.4183 6 20 9.58172 20 14Z" />
  </svg>
);

export const Wallet: FC<SVGProps<SVGSVGElement>> = ({
  fill = "none",
  height = 24,
  stroke = "white",
  strokeLinecap = "round",
  strokeLinejoin = "round",
  strokeWidth = 2,
  width = 24,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    {...{
      ...props,
      fill,
      height,
      stroke,
      strokeLinecap,
      strokeLinejoin,
      strokeWidth,
      width,
    }}
  >
    <path d="M17 6H22V11H17V6Z" />
    <path d="M21 12H3C2.46957 12 1.96086 11.7893 1.58579 11.4142C1.21071 11.0391 1 10.5304 1 10V6C1 5.46957 1.21071 4.96086 1.58579 4.58579C1.96086 4.21071 2.46957 4 3 4H21C21.5304 4 22.0391 4.21071 22.4142 4.58579C22.7893 4.96086 23 5.46957 23 6V10C23 10.5304 22.7893 11.0391 22.4142 11.4142C22.0391 11.7893 21.5304 12 21 12Z" />
    <path d="M3 12V18C3 18.5304 3.21071 19.0391 3.58579 19.4142C3.96086 19.7893 4.46957 20 5 20H19C19.5304 20 20.0391 19.7893 20.4142 19.4142C20.7893 19.0391 21 18.5304 21 18V12" />
    <path d="M7 16H13" />
  </svg>
);

export const Trash: FC<SVGProps<SVGSVGElement>> = ({
  fill = "none",
  height = 24,
  stroke = "white",
  strokeLinecap = "round",
  strokeLinejoin = "round",
  strokeWidth = 2,
  width = 24,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    {...{
      ...props,
      fill,
      height,
      stroke,
      strokeLinecap,
      strokeLinejoin,
      strokeWidth,
      width,
    }}
  >
    <path 
      d="M3 6H21M19 6V20C19 21 18 22 17 22H7C6 22 5 21 5 20V6M8 6V4C8 3 9 2 10 2H14C15 2 16 3 16 4V6M10 11V17M14 11V17" 
    />
  </svg>
);
