/** Primary environments, shared by the dock and the command palette. */
export const NAV = [
  { href: "/", label: "Universe", icon: "M12 3a9 9 0 100 18 9 9 0 000-18zm0 0c3 3 3 15 0 18m0-18c-3 3-3 15 0 18M3 12h18" },
  { href: "/network", label: "Network", icon: "M5 6a2 2 0 104 0 2 2 0 00-4 0zm10 0a2 2 0 104 0 2 2 0 00-4 0zM10 18a2 2 0 104 0 2 2 0 00-4 0zM7 8l4 8m6-8l-4 8M9 6h6" },
  { href: "/projects", label: "Multiverse", icon: "M12 8a4 4 0 100 8 4 4 0 000-8zM3 12c0-2 4-4 9-4s9 2 9 4-4 4-9 4-9-2-9-4z" },
  { href: "/ai", label: "AI", icon: "M9 3h6M12 3v3m-5 3h10a2 2 0 012 2v6a4 4 0 01-4 4H9a4 4 0 01-4-4v-6a2 2 0 012-2zm2 5h.01M15 14h.01M10 18h4" },
  { href: "/identity", label: "Identity", icon: "M12 4a4 4 0 100 8 4 4 0 000-8zM4 21c0-4 4-6 8-6s8 2 8 6" },
  { href: "/foundation", label: "Foundation", icon: "M3 10l9-6 9 6M5 10v9m4-9v9m6-9v9m4-9v9M3 20h18" },
  { href: "/vault", label: "Vault", icon: "M5 4h14v16H5zM9 9h6M9 13h6m-3 3v1" },
  { href: "/lab", label: "Lab", icon: "M9 3h6M10 3v6l-5 9a2 2 0 002 3h10a2 2 0 002-3l-5-9V3M8 15h8" },
  { href: "/collab", label: "Collaborate", icon: "M4 6h16v10H9l-5 4z" },
] as const;
