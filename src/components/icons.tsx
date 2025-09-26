import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
        <path d="M4 4h16v16H4z" fill="hsl(var(--primary))" />
        <path d="M7.5 16V8h2l2.5 4 2.5-4h2v8h-2v-3.5l-2.5 4-2.5-4V16h-2z" fill="hsl(var(--primary-foreground))"/>
    </svg>
  );
}
