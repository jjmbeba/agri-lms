"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import UserButton from "../auth/user-button";

const Navbar = () => {
  const pathname = usePathname();

  if (
    pathname.includes("/login") ||
    pathname.includes("/signup") ||
    pathname.includes("/forgot-password") ||
    pathname.includes("/reset-password")
  ) {
    return null;
  }

  return (
    <div className="sticky top-0 z-50 flex items-center justify-between bg-background px-10 py-4 shadow-sm">
      <span>Logo</span>
      <div className="flex items-center gap-4">
        <Link href="/">Home</Link>
        <Link href="/protected">Protected</Link>
        <UserButton />
      </div>
    </div>
  );
};

export default Navbar;
