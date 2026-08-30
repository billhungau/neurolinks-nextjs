import Image from "next/image";
import { IMG_SIZES } from "@/lib/image-sizes";

type Props = {
  src: string;
  alt: string;
  objectPosition?: string;
  priority?: boolean;
  minHeightClass?: string;
};

export function PageBanner({
  src,
  alt,
  objectPosition = "center",
  priority = true,
  minHeightClass = "min-h-[12rem] md:min-h-[18.75rem]",
}: Props) {
  return (
    <div className={`relative w-full overflow-hidden ${minHeightClass}`}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={IMG_SIZES.fullBleed}
        className="object-cover"
        style={{ objectPosition }}
      />
    </div>
  );
}
