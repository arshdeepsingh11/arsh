import type { ReactNode } from "react";

/** A device frame for mobile-app demonstrations. */
export function Phone({ children, caption }: { children: ReactNode; caption: ReactNode }) {
  return (
    <div className="phone-wrap">
      <div className="phone"><div className="notch" /><div className="screen">{children}</div></div>
      <p className="dim sm">{caption}</p>
    </div>
  );
}
