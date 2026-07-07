"use client";

import { Button } from "@heroui/react";
import clsx from "clsx";

import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Settings,
  Users,
  ShoppingBag,
  Heart,
  MapPin,
  Package,
  ShoppingCart,
  DollarSign,
  UserCog,
  Store,
  FileText,
} from "lucide-react";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { authClient } from "../../lib/auth-client";
import Image from "next/image";

import lexiCart from "../../../public/images/lexi-cart.png";

const SideNav = ({
  collapsed,
  setCollapsed,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;
  const role = user?.role;

  useEffect(() => {
    if (!isPending && !user) {
      router.replace("/signin");
    }
  }, [user, isPending, router]);

  if (isPending) return null;
  if (!user) return null;

  const menuItems = {
    reader: [
      { name: "Dashboard", href: "/dashboard/reader", icon: Settings },
      { name: "Profile", href: "/dashboard/reader/profile", icon: Users },
      { name: "Reading Lists", href: "/dashboard/reader/reading-list", icon: ShoppingBag },
      { name: "Wishlist", href: "/dashboard/reader/wish-list", icon: Heart },
      { name: "Reviews", href: "/dashboard/reader/reviews", icon: Package },
      { name: "Deliveris", href: "/dashboard/reader/delivery", icon: ShoppingCart },
    ],

    librarian: [
      { name: "Dashboard", href: "/dashboard/librarian", icon: Settings },
      { name: "Profile", href: "/dashboard/librarian/profile", icon: Users },
      { name: "Books", href: "/dashboard/librarian/books", icon: Store },
      { name: "Coupons", href: "/dashboard/librarian/coupons", icon: Package },
      { name: "Deliveris", href: "/dashboard/librarian/delivery", icon: ShoppingCart },
    ],

    admin: [
      { name: "Dashboard", href: "/dashboard/admin", icon: Settings },
      { name: "Profile", href: "/dashboard/admin/profile", icon: Users },
      { name: "Users", href: "/dashboard/admin/users", icon: FileText },
      { name: "Books", href: "/dashboard/admin/books", icon: Store },
      { name: "Roles", href: "/dashboard/admin/roles", icon: UserCog },
      { name: "Categories", href: "/dashboard/admin/categories", icon: Package },,
      { name: "Transactions", href: "/dashboard/admin/transactions", icon: ShoppingCart },
    ],
  };

  const navigation = menuItems[role] || [];
  
  return (
    <aside
      className={clsx(
        "h-full shadow-sm flex flex-col transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="h-16 flex items-center justify-between px-4 shadow-xs">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-3">
            <Image
              src={lexiCart}
              alt="LexiCart"
              width={100}
              height={100}
              className="h-auto"
              priority
            />
          </Link>
        )}
        <Button
          isIconOnly
          size="sm"
          variant="light"
          onPress={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </Button>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navigation.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.name} href={item.href}>
              <div
                className={clsx(
                  "flex items-center gap-3 px-3 py-2 mb-2 rounded-lg text-sm transition font-semibold",
                  active
                    ? "bg-[#ef0161]/10 text-[#ef0161]"
                    : "hover:bg-[#ef0161]/10 hover:text-[#ef0161] text-slate-600",
                  collapsed && "justify-center",
                )}
              >
                <Icon size={18} />
                {!collapsed && <span>{item.name}</span>}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t text-xs text-gray-500">
        {!collapsed ? "Admin Panel v1.0" : "v1"}
      </div>
    </aside>
  );
}

export default SideNav;