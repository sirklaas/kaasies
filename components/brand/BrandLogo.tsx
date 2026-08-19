import Image from 'next/image';

type BrandLogoProps = {
  priority?: boolean;
  className?: string;
};

const logoWidth = 1759;
const logoHeight = 534;

export function BrandLogo({ priority = false, className }: BrandLogoProps) {
  return (
    <Image
      alt=""
      aria-hidden="true"
      className={className}
      height={logoHeight}
      priority={priority}
      src="/brand/kaasies-logo.webp"
      width={logoWidth}
    />
  );
}
