import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  showText?: boolean;
};

const Logo = ({ showText = false }: LogoProps) => {
  return (
    <div className="flex justify-center gap-2 md:justify-start">
      <Link className="flex items-center gap-2 font-medium" href="/">
        <div className="flex size-6 items-center justify-center rounded-md">
          <Image alt="AATI LMS" height={24} src="/aati-logo.png" width={24} />
        </div>
        {showText && <span className="font-semibold text-lg tracking-tighter">AATI LMS</span>}
      </Link>
    </div>
  );
};

export default Logo;
