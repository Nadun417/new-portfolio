import { getImageProps } from "next/image";

/**
 * A `fill` image that can swap to a second source by media query
 * (art direction): `swap.src` is shown while `swap.media` matches, `src`
 * otherwise. Only the matching file is downloaded.
 */
export default function ArtImage({
  src,
  alt,
  sizes,
  swap,
  className,
  eager = false,
  draggable,
}: {
  src: string;
  alt: string;
  sizes: string;
  swap?: { media: string; src: string };
  className?: string;
  /** above-the-fold images: load immediately at high priority */
  eager?: boolean;
  draggable?: boolean;
}) {
  const common = { alt, sizes, fill: true, loading: eager ? ("eager" as const) : ("lazy" as const) };
  const { props } = getImageProps({ ...common, src });
  const swapSet = swap && getImageProps({ ...common, src: swap.src }).props.srcSet;

  return (
    <picture>
      {swap && <source media={swap.media} srcSet={swapSet} sizes={sizes} />}
      <img {...props} alt={alt} className={className} draggable={draggable} fetchPriority={eager ? "high" : undefined} />
    </picture>
  );
}
