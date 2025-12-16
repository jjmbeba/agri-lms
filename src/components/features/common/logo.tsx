import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  showText?: boolean;
  disableLink?: boolean;
};

const Logo = ({ showText = false, disableLink = false }: LogoProps) => {
  const logoContent = (
    <div className="flex items-center gap-2 font-medium">
      <div className="flex size-6 items-center justify-center rounded-md">
        <Image alt="AATI LMS" height={24} src="/aati-logo.png" width={24} />
      </div>
      {showText && <span className="font-semibold text-lg tracking-tighter">AATI LMS</span>}
    </div>
  );

  return (
    <div className="flex justify-center gap-2 md:justify-start">
      {disableLink ? (
        logoContent
      ) : (
        <Link href="/">{logoContent}</Link>
      )}
    </div>
  );
};

export default Logo;
