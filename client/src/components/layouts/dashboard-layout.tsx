import { useState } from "react";
import type { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LogOut,
  Menu,
  X,
  Home,
  Users,
  CheckSquare,
  BarChart,
} from "lucide-react";
import { useMainStore } from "../../store";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { coleAPI } from "@/lib/utils";
import { isAxiosError } from "axios";

interface SidebarItem {
  name: string;
  href: string;
  icon: ReactNode;
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const user = useMainStore((state) => state.user);
  const navigate = useNavigate();

  const adminLinks: SidebarItem[] = [
    {
      name: "Overview",
      href: "/dashboard",
      icon: <Home className="h-5 w-5" />,
    },
    {
      name: "Elections",
      href: "/dashboard/elections",
      icon: <CheckSquare className="h-5 w-5" />,
    },
    {
      name: "Students",
      href: "/dashboard/students",
      icon: <Users className="h-5 w-5" />,
    },
    {
      name: "Reports",
      href: "/dashboard/reports",
      icon: <BarChart className="h-5 w-5" />,
    },
  ];

  const studentLinks: SidebarItem[] = [
    { name: "Dashboard", href: "/student", icon: <Home className="h-5 w-5" /> },
    {
      name: "Active Elections",
      href: "/student/elections",
      icon: <CheckSquare className="h-5 w-5" />,
    },
  ];

  const links = user?.adminId ? adminLinks : studentLinks;

  const logoutMutation = useMutation({
    mutationFn: coleAPI("/api/auth/logout", "POST"),
    onSuccess: () => {
      useMainStore.getState().setUser(null);
      useMainStore.getState().setToken("");
      navigate("/login");
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to logout");
      }
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate({});
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-zinc-50 font-sans text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 animate-in bg-black/50 backdrop-blur-sm transition-all fade-in lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 transform flex-col overflow-hidden border-r border-primary/20 bg-primary text-primary-foreground transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 dark:bg-black dark:text-foreground ${
          isMobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-primary/80 to-primary mix-blend-multiply" />
        <div className="pointer-events-none absolute inset-0 bg-[url('/images/bg.webp')] bg-cover bg-center opacity-20" />

        <div className="relative z-10 flex h-16 items-center justify-between border-b border-primary-foreground/10 px-6">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center rounded-lg bg-primary-foreground/10 p-1 shadow-sm dark:bg-white">
              <img
                src="/images/pac-logo.svg"
                alt="PAC Logo"
                className="h-7 w-7 object-contain"
              />
            </div>
            <span className="text-xl font-bold tracking-tight">PAC SALUG</span>
          </div>
          <button
            className="text-primary-foreground/60 hover:text-primary-foreground lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative z-10 flex-1 space-y-1 overflow-y-auto px-4 py-6">
          {links.map((link) => {
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.name}
                to={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 ${
                  isActive
                    ? "bg-primary-foreground/15 font-medium text-primary-foreground shadow-sm dark:bg-white/15 dark:text-white"
                    : "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground dark:text-white"
                }`}
              >
                <div
                  className={`${isActive ? "text-primary-foreground dark:text-white" : "text-primary-foreground/60 group-hover:text-primary-foreground dark:text-white"} transition-colors`}
                >
                  {link.icon}
                </div>
                {link.name}
              </Link>
            );
          })}
        </div>

        <p className="mb-2 text-center text-white">BSCS-4 Batch 2026-2027</p>

        <div className="relative z-10 border-t border-primary-foreground/10 p-4 dark:border-foreground/10">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start text-primary-foreground/70 transition-colors hover:bg-red-500/10 hover:text-red-400 dark:bg-transparent dark:text-white dark:hover:text-red-400"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between overflow-hidden border-b border-primary/20 bg-primary px-4 text-primary-foreground sm:px-6 lg:px-8 dark:border-foreground/10 dark:bg-black dark:text-white">
          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-primary/80 to-primary mix-blend-multiply" />
          <div className="pointer-events-none absolute inset-0 bg-[url('/images/bg.webp')] bg-cover bg-top opacity-20" />
          <div className="relative z-10 flex items-center">
            <button
              className="mr-3 -ml-2 rounded-md p-2 text-primary-foreground/60 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground lg:hidden"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="hidden text-xl font-semibold tracking-tight capitalize sm:block">
              {location.pathname.split("/").pop() === "dashboard" ||
              location.pathname.split("/").pop() === "student"
                ? "Overview"
                : location.pathname.split("/").pop()}
            </h1>

            <h1 className="text-xl font-semibold tracking-tight capitalize sm:block">
              PAC Voting System
            </h1>
          </div>

          <div className="relative z-10 flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm leading-none font-medium">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="mt-1 text-xs text-primary-foreground/60 dark:text-foreground">
                {user?.email}
              </p>
            </div>
            <Avatar className="h-9 w-9 cursor-pointer border-2 border-primary-foreground/20 shadow-sm ring-primary-foreground/50 transition-all hover:ring-2 dark:border-foreground/20 dark:ring-foreground/50">
              <AvatarImage
                src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user?.firstName}`}
              />
              <AvatarFallback className="bg-primary-foreground/10 font-semibold text-primary-foreground dark:bg-foreground/10 dark:text-white">
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        <div className="relative flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="pointer-events-none absolute top-0 left-0 -z-10 h-64 w-full bg-linear-to-b from-indigo-50/50 to-transparent dark:from-indigo-950/20" />
          <div className="mx-auto max-w-7xl">{children}</div>
        </div>
      </main>
    </div>
  );
}
