import { FC, RefObject, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

interface ComponentProps {
  href?: string;
  targetBlank?: boolean;
  text: string;
}

interface InitialState {
  counter: number;
  ellipsis: string;
  truncating: boolean;
}

const Component: FC<ComponentProps> = ({ href, targetBlank, text }) => {
  const initialState: InitialState = {
    counter: 0,
    ellipsis: "",
    truncating: true,
  };
  const [state, setState] = useState(initialState);
  const { counter, ellipsis, truncating } = state;
  const elmRef = useRef<HTMLElement>(null);

  const ellipsisDidUpdate = (): void => {
    if (elmRef.current) {
      const [child] = elmRef.current.children;
      const parentWidth = elmRef.current.clientWidth;
      const childWidth = child?.clientWidth ?? 0;

      if (childWidth > parentWidth) {
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
  };

  const componentDidUpdate = (): void => {
    setState((prevState) => ({
      ...prevState,
      ellipsis: text,
      truncating: true,
    }));
  };

  useEffect(ellipsisDidUpdate, [ellipsis]);
  useEffect(componentDidUpdate, [text]);

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

export default Component;
