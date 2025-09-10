import Image from "next/image";
import type { PropsWithChildren } from "react";
import AuthLogo from "./auth-logo";

const AuthPageContainer = ({ children }: PropsWithChildren) => {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <AuthLogo />
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">{children}</div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <Image
          alt="Auth Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          fill
          priority
          quality={100}
          src={"/auth-image.webp"}
        />
      </div>
    </div>
  );
};

export default AuthPageContainer;
