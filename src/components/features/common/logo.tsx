import { GalleryVerticalEnd } from "lucide-react";
import Link from "next/link";

const Logo = () => {
  return (
    <div className="flex justify-center gap-2 md:justify-start">
      <Link className="flex items-center gap-2 font-medium" href="/">
        <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <GalleryVerticalEnd className="size-5" />
        </div>
        {/* Agri LMS */}
      </Link>
    </div>
  );
};

export default Logo;
