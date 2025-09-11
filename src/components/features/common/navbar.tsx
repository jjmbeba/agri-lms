"use client";

import { MenuIcon } from "lucide-react";
import { usePathname } from "next/navigation";
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
import AuthLogo from "../auth/auth-logo";
import UserButton from "../auth/user-button";

const Navbar = () => {
  const pathname = usePathname();
  const authPages = [
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ];
  const isAuthPage = authPages.includes(pathname);

  if (isAuthPage) {
    return null;
  }

  const features = [
    {
      title: "Courses",
      description: "Soil health, crop science, and livestock modules",
      href: "/courses",
    },
    {
      title: "Farmer Analytics",
      description: "Track learning progress and farm impact",
      href: "/analytics",
    },
    {
      title: "Extension Hub",
      description: "Access agronomist guides and field advisories",
      href: "/extension",
    },
    {
      title: "Market & Prices",
      description: "Daily commodity prices across Kenyan markets",
      href: "/market",
    },
    {
      title: "Resources",
      description: "Toolkits, templates, and best-practice checklists",
      href: "/resources",
    },
    {
      title: "Support",
      description: "Get help in English or Kiswahili",
      href: "/support",
    },
  ];

  return (
    <section className="px-10 py-4">
      <div className="container">
        <nav className="flex items-center justify-between">
          <AuthLogo />
          <NavigationMenu className="hidden lg:block">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="cursor-pointer">
                  Features
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid w-[600px] grid-cols-2 p-3">
                    {features.map((feature) => (
                      <NavigationMenuLink
                        className="rounded-md p-3 transition-colors hover:bg-muted/70"
                        href={feature.href}
                        key={feature.title}
                      >
                        <div key={feature.title}>
                          <p className="mb-1 font-semibold text-foreground">
                            {feature.title}
                          </p>
                          <p className="text-muted-foreground text-sm">
                            {feature.description}
                          </p>
                        </div>
                      </NavigationMenuLink>
                    ))}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  className={navigationMenuTriggerStyle()}
                  href="/programs"
                >
                  Programs
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
                  href="/contact"
                >
                  Contact
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          <div className="hidden items-center gap-4 lg:flex">
            <UserButton />
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
                      AgriLMS Kenya
                    </span>
                  </a>
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col p-4">
                <Accordion className="mt-4 mb-2" collapsible type="single">
                  <AccordionItem className="border-none" value="solutions">
                    <AccordionTrigger className="text-base hover:no-underline">
                      Features
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid md:grid-cols-2">
                        {features.map((feature) => (
                          <a
                            className="rounded-md p-3 transition-colors hover:bg-muted/70"
                            href={feature.href}
                            key={feature.title}
                          >
                            <div key={feature.title}>
                              <p className="mb-1 font-semibold text-foreground">
                                {feature.title}
                              </p>
                              <p className="text-muted-foreground text-sm">
                                {feature.description}
                              </p>
                            </div>
                          </a>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                <div className="flex flex-col gap-6">
                  <a className="font-medium" href="/courses">
                    Courses
                  </a>
                  <a className="font-medium" href="/market">
                    Market & Prices
                  </a>
                  <a className="font-medium" href="/resources">
                    Resources
                  </a>
                </div>
                <div className="mt-6 flex flex-col gap-4">
                  <UserButton />
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
