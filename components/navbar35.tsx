"use client";

import React from "react";
import {
  Building2,
  Car,
  Compass,
  Flame,
  Key,
  Menu,
  Plane,
  Search,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { cn } from "cn";

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
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NavUser } from "@/components/nav-user";

interface MenuItem {
  title: string;
  url: string;
  description?: string;
  icon?: React.ReactNode;
  items?: MenuItem[];
}

interface Navbar35Props {
  className?: string;
  logo: {
    url: string;
    title: string;
  };
  menu: MenuItem[];
  auth: {
    login: {
      title: string;
      url: string;
    };
    signup: {
      title: string;
      url: string;
    };
  };
}

const defaultProps: Navbar35Props = {
  logo: {
    url: "/",
    title: "RidePoa",
  },
  menu: [
    {
      title: "Explore Cars",
      url: "/buy-a-car"
    },
    {
      title: "Sell a Car",
      url: "/sell-a-car"
    },
    {
      title: "Buy Insurance",
      url: "/buy-insurance",
    },
    {
      title: "About",
      url: "/about",
    },
    {
      title: "Contact Us",
      url: "/contact-us",
    },
    {
      title: "Blog",
      url: "/blog",
    },
  ],
  auth: {
    login: { title: "Sign In", url: "/login" },
    signup: { title: "Get Started", url: "/signup" },
  },
};

const Navbar35 = ({ className, ...props }: Partial<Navbar35Props>) => {
  const { logo, menu, auth } = {
    ...defaultProps,
    ...props,
  };

  return (
    <header className={cn("sticky top-0 z-50 w-full border-b border-border bg-background backdrop-blur-md transition-colors", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <nav className="hidden grid-cols-[1fr_auto_1fr] items-center lg:grid">
          {/* Brand Logo */}
          <a
            href={logo.url}
            className="flex items-center gap-2.5 justify-self-start cursor-pointer border-none group"
          >
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground transition-transform group-hover:scale-105 shadow-sm">
              <Car className="size-6" />
            </div>
            <span className="text-xl font-black tracking-tight text-foreground transition-transform group-hover:scale-105">
              Ride<span className="text-primary">Poa</span>
              <p className="text-xs font-semibold text-muted-foreground -mt-1">Buy or Sell a Car</p>
            </span>
          </a>

          {/* Desktop Navigation */}
          <NavigationMenu className="justify-self-center text-sm">
            <NavigationMenuList className="gap-1">
              {menu.map((item) => renderMenuItem(item))}
            </NavigationMenuList>
          </NavigationMenu>

          {/* Desktop Action Buttons */}
          <div className="flex items-center gap-3 justify-self-end">
            <NavUser variant="header" />

          </div>
        </nav>

        {/* Mobile Navigation */}
        <div className="block lg:hidden">
          <div className="flex items-center justify-between">
            <a href={logo.url} className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
                <Car className="size-4" />
              </div>
              <span className="text-lg font-black tracking-tight text-foreground">
                Ride<span className="text-primary">Poa</span>
              </span>
            </a>
            <Sheet>
              <SheetTrigger render={<Button variant="outline" size="icon" className="border-border text-foreground hover:bg-muted cursor-pointer" />}>
                <Menu className="size-5" />
              </SheetTrigger>
              <SheetContent className="overflow-y-auto bg-card text-card-foreground border-l border-border">
                <SheetHeader>
                  <SheetTitle>
                    <a href={logo.url} className="flex items-center gap-2.5 mt-2">
                      <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
                        <Car className="size-4" />
                      </div>
                      <span className="text-lg font-black tracking-tight text-foreground">
                        Ride<span className="text-primary">Poa</span>
                      </span>
                    </a>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-6 p-4">
                  <Accordion className="flex w-full flex-col gap-3">
                    {menu.map((item) => renderMobileMenuItem(item))}
                  </Accordion>

                  <div className="flex flex-col gap-3 pt-4 border-t border-border">
                    <NavUser variant="mobile" />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

const renderMenuItem = (item: MenuItem) => {
  if (item.items) {
    return (
      <NavigationMenuItem key={item.title}>
        <NavigationMenuTrigger className="bg-transparent hover:bg-muted/70 text-foreground font-medium rounded-lg text-sm px-3.5 py-2 cursor-pointer">
          {item.title}
        </NavigationMenuTrigger>
        <NavigationMenuContent className="bg-card text-card-foreground border border-border shadow-xl rounded-xl p-2 min-w-80">
          <div className="grid gap-1">
            {item.items.map((subItem) => (
              <NavigationMenuLink key={subItem.title} className="w-full" render={<SubMenuLink item={subItem} />} />
            ))}
          </div>
        </NavigationMenuContent>
      </NavigationMenuItem>
    );
  }

  return (
    <NavigationMenuItem key={item.title}>
      <NavigationMenuLink
        href={item.url}
        className="group inline-flex h-9 w-max items-center justify-center rounded-lg bg-transparent px-3.5 py-2 text-sm font-medium transition-colors hover:bg-muted/70 text-foreground cursor-pointer"
      >
        {item.title}
      </NavigationMenuLink>
    </NavigationMenuItem>
  );
};

const renderMobileMenuItem = (item: MenuItem) => {
  if (item.items) {
    return (
      <AccordionItem key={item.title} value={item.title} className="border-b border-border/50">
        <AccordionTrigger className="text-base py-2.5 font-semibold text-foreground hover:no-underline cursor-pointer">
          {item.title}
        </AccordionTrigger>
        <AccordionContent className="mt-1 pb-3">
          <div className="flex flex-col gap-1">
            {item.items.map((subItem) => (
              <SubMenuLink key={subItem.title} item={subItem} />
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    );
  }

  return (
    <a
      key={item.title}
      href={item.url}
      className="text-base font-semibold text-foreground py-2 hover:text-primary transition-colors cursor-pointer"
    >
      {item.title}
    </a>
  );
};

const SubMenuLink = ({ item }: { item: MenuItem }) => {
  return (
    <a
      className="flex items-start gap-3.5 rounded-lg p-2.5 leading-none no-underline transition-colors outline-none select-none hover:bg-muted/80 group cursor-pointer"
      href={item.url}
    >
      <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0 mt-0.5">
        {item.icon}
      </div>
      <div>
        <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
          {item.title}
        </div>
        {item.description && (
          <p className="text-xs leading-relaxed text-muted-foreground mt-1">
            {item.description}
          </p>
        )}
      </div>
    </a>
  );
};

export { Navbar35 };
