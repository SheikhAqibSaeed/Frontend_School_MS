'use client';

import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

type RouterLinkProps = {
  href: string;
  className?: string;
  /** When true, calls `router.replace` instead of `router.push`. */
  replace?: boolean;
  children: ReactNode;
};

/**
 * Client-side navigation using the App Router `useRouter` API (no `next/link`).
 * Renders a focusable control with `role="link"` for assistive tech.
 */
export function RouterLink({ href, className, replace, children }: RouterLinkProps) {
  const router = useRouter();
  return (
    <button
      type="button"
      role="link"
      className={cn(
        'm-0 inline cursor-pointer border-0 bg-transparent p-0 font-inherit text-inherit',
        className,
      )}
      onClick={() => (replace ? router.replace(href) : router.push(href))}
    >
      {children}
    </button>
  );
}
