import { NavLink as RouterNavLink, NavLinkProps } from "react-router-dom";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Props for the NavLinkCompat component, extending Router's NavLinkProps
 * while enabling simplified class styling for active and pending route states.
 */
interface NavLinkCompatProps extends Omit<NavLinkProps, "className"> {
  /** Base classes applied to the anchor link across all states */
  className?: string;
  /** Classes applied only when the link matches the current active route */
  activeClassName?: string;
  /** Classes applied when the link route is in a pending loading state */
  pendingClassName?: string;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, pendingClassName, to, ...props }, ref) => {
    return (
      <RouterNavLink
        ref={ref}
        to={to}
        className={({ isActive, isPending }) =>
          cn(className, isActive && activeClassName, isPending && pendingClassName)
        }
        {...props}
      />
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };
