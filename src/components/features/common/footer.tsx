"use client";

import { usePathname } from "next/navigation";
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa";
import { isAuthPage } from "../auth/utils";
import Logo from "./logo";

const defaultSections = [
  {
    title: "Learning",
    links: [
      { name: "Courses", href: "/courses" },
      { name: "Learning Paths", href: "/paths" },
      { name: "Certifications", href: "/certifications" },
      { name: "Instructors", href: "/instructors" },
    ],
  },
  {
    title: "Programs",
    links: [
      { name: "Extension Hub", href: "/extension" },
      { name: "Farmer Analytics", href: "/analytics" },
      { name: "Market & Prices", href: "/market" },
      { name: "Community", href: "/community" },
    ],
  },
  {
    title: "Resources",
    links: [
      { name: "Help Center", href: "/help" },
      { name: "Guides & Toolkits", href: "/resources" },
      { name: "Partners", href: "/partners" },
      { name: "Contact", href: "/contact" },
    ],
  },
];

const defaultSocialLinks = [
  {
    icon: <FaInstagram className="size-5" />,
    href: "/social/instagram",
    label: "Instagram",
  },
  {
    icon: <FaFacebook className="size-5" />,
    href: "/social/facebook",
    label: "Facebook",
  },
  {
    icon: <FaTwitter className="size-5" />,
    href: "/social/twitter",
    label: "Twitter",
  },
  {
    icon: <FaLinkedin className="size-5" />,
    href: "/social/linkedin",
    label: "LinkedIn",
  },
];

const defaultLegalLinks = [
  { name: "Terms and Conditions", href: "/terms" },
  { name: "Privacy Policy", href: "/privacy" },
];

const Footer = () => {
  const pathname = usePathname();

  if (isAuthPage(pathname)) {
    return null;
  }

  const sections = defaultSections;
  const description =
    "Digital learning for Kenyan agriculture: soil health, crop science, livestock, and agribusiness.";
  const socialLinks = defaultSocialLinks;
  const copyright = `© ${new Date().getFullYear()} AgriLMS Kenya. All rights reserved.`;
  const legalLinks = defaultLegalLinks;
  return (
    <section className="px-10 py-32">
      <div className="container">
        <div className="flex w-full flex-col justify-between gap-10 lg:flex-row lg:items-start lg:text-left">
          <div className="flex w-full flex-col justify-between gap-6 lg:items-start">
            {/* Logo */}
            <div className="flex items-center gap-2 lg:justify-start">
              <Logo />
            </div>
            <p className="max-w-[70%] text-muted-foreground text-sm">
              {description}
            </p>
            <ul className="flex items-center space-x-6 text-muted-foreground">
              {socialLinks.map((social) => (
                <li
                  className="font-medium hover:text-primary"
                  key={social.href}
                >
                  <a aria-label={social.label} href={social.href}>
                    {social.icon}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid w-full gap-6 md:grid-cols-3 lg:gap-20">
            {sections.map((section) => (
              <div key={section.title}>
                <h3 className="mb-4 font-bold">{section.title}</h3>
                <ul className="space-y-3 text-muted-foreground text-sm">
                  {section.links.map((link) => (
                    <li
                      className="font-medium hover:text-primary"
                      key={link.href}
                    >
                      <a href={link.href}>{link.name}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-8 flex flex-col justify-between gap-4 border-t py-8 font-medium text-muted-foreground text-xs md:flex-row md:items-center md:text-left">
          <p className="order-2 lg:order-1">{copyright}</p>
          <ul className="order-1 flex flex-col gap-2 md:order-2 md:flex-row">
            {legalLinks.map((link) => (
              <li className="hover:text-primary" key={link.href}>
                <a href={link.href}> {link.name}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default Footer;
