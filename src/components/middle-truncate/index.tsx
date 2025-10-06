import { FC, RefObject, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useResizeObserver } from "@/hooks/useResizeObserver";

type MiddleTruncateProps = {
  href?: string;
  targetBlank?: boolean;
  text: string;
};

export const MiddleTruncate: FC<MiddleTruncateProps> = ({
  href,
  targetBlank,
  text,
}) => {
  const [state, setState] = useState({
    counter: 0,
    ellipsis: "",
    truncating: true,
    wrapperWidth: 0,
  });
  const { counter, ellipsis, truncating, wrapperWidth } = state;
  const elmRef = useResizeObserver(({ width = 0 }) => {
    setState((prevState) => ({
      ...prevState,
      wrapperWidth: width,
      ellipsis: text,
      truncating: true,
    }));
  }, "width");

  useEffect(() => {
    if (elmRef.current) {
      const [child] = elmRef.current.children;
      const clientWidth = child?.clientWidth ?? 0;

      if (clientWidth > wrapperWidth) {
        const chunkLen = Math.ceil(text.length / 2) - counter;

        setState((prevState) => ({
          ...prevState,
          counter: counter + 1,
          ellipsis: `${text.slice(0, chunkLen)}...${text.slice(chunkLen * -1)}`,
        }));
      } else {
        setState((prevState) => ({
          ...prevState,
          counter: 0,
          truncating: false,
        }));
      }
    }
  }, [ellipsis, counter, elmRef, text, wrapperWidth]);

  useEffect(() => {
    setState((prevState) => ({
      ...prevState,
      ellipsis: text,
      truncating: true,
    }));
  }, [text]);

  const children = truncating ? <span>{ellipsis}</span> : ellipsis;

  return href ? (
    targetBlank ? (
      <a
        href={href}
        ref={elmRef as RefObject<HTMLAnchorElement>}
        rel="noopener noreferrer"
        className="middle-truncate"
        target="_blank"
      >
        {children}
      </a>
    ) : (
      <Link
        to={href}
        ref={elmRef as RefObject<HTMLAnchorElement>}
        className="middle-truncate"
      >
        {children}
      </Link>
    )
  ) : (
    <span
      ref={elmRef as RefObject<HTMLSpanElement>}
      className="middle-truncate"
    >
      {children}
    </span>
  );
};
