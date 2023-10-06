import { CSSProperties, ReactNode } from "react";
import useFitText from "use-fit-text";

export const Textfit = function (props: {
  children: ReactNode;
  id?: string;
  style?: CSSProperties;
}) {
  const { fontSize, ref } = useFitText();
  return (
    <div id={props.id} ref={ref} style={{ fontSize, ...props.style }}>
      {props.children}
    </div>
  );
};
