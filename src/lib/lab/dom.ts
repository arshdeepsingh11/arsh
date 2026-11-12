/** Tiny DOM helpers for the imperative lab simulations. */

export const esc = (s: unknown) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

export function q<E extends Element = HTMLElement>(root: ParentNode, sel: string): E {
  const el = root.querySelector<E>(sel);
  if (!el) throw new Error(`Missing element: ${sel}`);
  return el;
}

export const qa = <E extends Element = HTMLElement>(root: ParentNode, sel: string): E[] => [...root.querySelectorAll<E>(sel)];

/** The element that received the event, typed loosely enough to read data attributes and form values. */
export const target = (e: Event) => e.target as HTMLElement & { value: string; checked: boolean };

export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
