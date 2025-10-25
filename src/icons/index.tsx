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

export const ChartPie: FC<SVGProps<SVGSVGElement>> = ({
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
    <path d="M21.2099 15.8901C20.5737 17.3946 19.5787 18.7203 18.3118 19.7514C17.0449 20.7825 15.5447 21.4875 13.9424 21.8049C12.34 22.1222 10.6843 22.0422 9.12006 21.5719C7.55578 21.1015 6.13054 20.2551 4.96893 19.1067C3.80733 17.9583 2.94473 16.5428 2.45655 14.984C1.96837 13.4252 1.86948 11.7706 2.16851 10.1647C2.46755 8.55886 3.15541 7.05071 4.17196 5.77211C5.18851 4.49351 6.5028 3.4834 7.99992 2.83008M20.9999 11.9999C21.5519 11.9999 22.0049 11.5509 21.9499 11.0019C21.7194 8.70609 20.702 6.56062 19.0702 4.92924C17.4385 3.29786 15.2928 2.28096 12.9969 2.05092C12.4469 1.99592 11.9989 2.44892 11.9989 3.00092V11.0009C11.9989 11.2661 12.1043 11.5205 12.2918 11.708C12.4793 11.8956 12.7337 12.0009 12.9989 12.0009L20.9999 11.9999Z" />
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
    <path d="M12 6V12L16 14M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" />
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

export const Layers: FC<SVGProps<SVGSVGElement>> = ({
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
    <path d="M2 12C1.99953 12.1913 2.05392 12.3787 2.15672 12.5399C2.25952 12.7012 2.40642 12.8297 2.58 12.91L11.18 16.82C11.4392 16.9374 11.7205 16.9981 12.005 16.9981C12.2895 16.9981 12.5708 16.9374 12.83 16.82L21.41 12.92C21.587 12.8404 21.737 12.7111 21.8418 12.5477C21.9466 12.3844 22.0015 12.1941 22 12M2 17C1.99953 17.1913 2.05392 17.3787 2.15672 17.5399C2.25952 17.7012 2.40642 17.8297 2.58 17.91L11.18 21.82C11.4392 21.9374 11.7205 21.9981 12.005 21.9981C12.2895 21.9981 12.5708 21.9374 12.83 21.82L21.41 17.92C21.587 17.8404 21.737 17.7111 21.8418 17.5477C21.9466 17.3844 22.0015 17.1941 22 17M12.83 2.18011C12.5694 2.06126 12.2864 1.99976 12 1.99976C11.7136 1.99976 11.4305 2.06126 11.17 2.18011L2.59996 6.08011C2.42251 6.15836 2.27164 6.28651 2.16573 6.44897C2.05981 6.61143 2.00342 6.80118 2.00342 6.99511C2.00342 7.18905 2.05981 7.3788 2.16573 7.54126C2.27164 7.70371 2.42251 7.83187 2.59996 7.91011L11.18 11.8201C11.4405 11.939 11.7236 12.0005 12.01 12.0005C12.2964 12.0005 12.5794 11.939 12.84 11.8201L21.42 7.92011C21.5974 7.84187 21.7483 7.71371 21.8542 7.55126C21.9601 7.3888 22.0165 7.19905 22.0165 7.00511C22.0165 6.81118 21.9601 6.62143 21.8542 6.45897C21.7483 6.29651 21.5974 6.16836 21.42 6.09011L12.83 2.18011Z" />
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
    <path d="M19 7V4C19 3.73478 18.8946 3.48043 18.7071 3.29289C18.5196 3.10536 18.2652 3 18 3H5C4.46957 3 3.96086 3.21071 3.58579 3.58579C3.21071 3.96086 3 4.46957 3 5M3 5C3 5.53043 3.21071 6.03914 3.58579 6.41421C3.96086 6.78929 4.46957 7 5 7H20C20.2652 7 20.5196 7.10536 20.7071 7.29289C20.8946 7.48043 21 7.73478 21 8V12M3 5V19C3 19.5304 3.21071 20.0391 3.58579 20.4142C3.96086 20.7893 4.46957 21 5 21H20C20.2652 21 20.5196 20.8946 20.7071 20.7071C20.8946 20.5196 21 20.2652 21 20V16M21 12H18C17.4696 12 16.9609 12.2107 16.5858 12.5858C16.2107 12.9609 16 13.4696 16 14C16 14.5304 16.2107 15.0391 16.5858 15.4142C16.9609 15.7893 17.4696 16 18 16H21M21 12C21.2652 12 21.5196 12.1054 21.7071 12.2929C21.8946 12.4804 22 12.7348 22 13V15C22 15.2652 21.8946 15.5196 21.7071 15.7071C21.5196 15.8946 21.2652 16 21 16" />
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
    <path d="M3 6H21M19 6V20C19 21 18 22 17 22H7C6 22 5 21 5 20V6M8 6V4C8 3 9 2 10 2H14C15 2 16 3 16 4V6M10 11V17M14 11V17" />
  </svg>
);
