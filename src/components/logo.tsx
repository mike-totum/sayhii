import Image from "next/image";

type Props = { className?: string };

// Official sayhii trademark logo. Used throughout via this shared component.
export function Logo({ className = "" }: Props) {
  return (
    <Image
      src="/brand/sayhii-logo.png"
      alt="sayhii"
      width={464}
      height={240}
      className={`h-7 w-auto ${className}`}
    />
  );
}
