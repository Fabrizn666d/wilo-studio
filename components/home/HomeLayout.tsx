import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from "react";
import styles from "./home-layout.module.css";

type FrameSize = "narrow" | "standard" | "wide";
type SectionSpacing = "compact" | "regular" | "scene";

function classes(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

type ViewportFrameProps = ComponentPropsWithoutRef<"div"> & {
  size?: FrameSize;
};

export function ViewportFrame({ className, size = "standard", ...props }: ViewportFrameProps) {
  return <div className={classes(styles.viewportFrame, styles[size], className)} {...props} />;
}

type FullBleedSectionProps = ComponentPropsWithoutRef<"section"> & {
  spacing?: SectionSpacing;
};

export const FullBleedSection = forwardRef<HTMLElement, FullBleedSectionProps>(
  function FullBleedSection({ className, spacing = "regular", ...props }, ref) {
    return <section className={classes(styles.fullBleedSection, styles[spacing], className)} data-fullpage-section="" ref={ref} {...props} />;
  },
);

type SectionShellProps = Omit<FullBleedSectionProps, "children"> & {
  children: ReactNode;
  frame?: FrameSize;
  frameClassName?: string;
};

export const SectionShell = forwardRef<HTMLElement, SectionShellProps>(
  function SectionShell({ children, frame = "standard", frameClassName, ...props }, ref) {
    return (
      <FullBleedSection ref={ref} {...props}>
        <ViewportFrame className={frameClassName} size={frame}>{children}</ViewportFrame>
      </FullBleedSection>
    );
  },
);

type CarouselFrameProps = ComponentPropsWithoutRef<"div"> & {
  edge?: "safe" | "wide";
};

export function CarouselFrame({ className, edge = "safe", ...props }: CarouselFrameProps) {
  return <div className={classes(styles.carouselFrame, styles[`carousel${edge}`], className)} {...props} />;
}
