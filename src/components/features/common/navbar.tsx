"use client";

import { MenuIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { PropsWithChildren } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import ThemeToggle from "@/components/ui/theme-toggle";
import { isPublicPage } from "../auth/utils";
import Logo from "./logo";

const Navbar = ({ children }: PropsWithChildren) => {
  const pathname = usePathname();

  if (!isPublicPage(pathname)) {
    return null;
  }
  
  return (
    <section className="px-10 py-4">
      <div className="container">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
              <Logo showText={true} />
          </div>
          <NavigationMenu className="hidden lg:block">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink
                  className={navigationMenuTriggerStyle()}
                  href="/courses"
                >
                  Courses
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  className={navigationMenuTriggerStyle()}
                  href="/partners"
                >
                  Partners
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  className={navigationMenuTriggerStyle()}
                  href="/about-us"
                >
                  About Us
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          <div className="hidden items-center gap-4 lg:flex">
            <ThemeToggle />
            {children}
          </div>
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button size="icon" variant="outline">
                <MenuIcon className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent className="max-h-screen overflow-auto" side="top">
              <SheetHeader>
                <SheetTitle>
                  <a className="flex items-center gap-2" href="/">
                    <span className="font-semibold text-lg tracking-tighter">
                      AATI LMS
                    </span>
                  </a>
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col p-4">
                <div className="flex flex-col gap-6">
                  <Link className="font-medium" href="/courses">
                    Courses
                  </Link>
                  <Link className="font-medium" href="/about-us">
                    About Us
                  </Link>
                </div>
                <div className="mt-6 flex flex-col gap-4">
                  <ThemeToggle />
                  {children}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </section>
  );
};

export default Navbar;
