import type { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* left side - hidden on mobile */}
      <div className="relative hidden flex-col bg-primary p-10 text-primary-foreground lg:flex">
        <div className="absolute inset-0 bg-linear-to-t from-primary/80 to-primary mix-blend-multiply" />

        <div className="absolute inset-0 bg-[url('/images/bg.webp')] bg-cover bg-center opacity-20" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-foreground p-1.5 text-primary shadow-sm">
            <img
              src="/images/sgo-logo.svg"
              alt="SGO Logo"
              className="h-full w-full object-contain"
            />
          </div>
          <span className="text-xl font-bold tracking-tight">PAC SGO</span>
        </div>

        {/* PAC logo*/}
        <div className="relative z-10 flex flex-1 items-center justify-center opacity-90 mix-blend-screen">
          <img
            src="/images/pac-logo.svg"
            alt="PAC Logo"
            className="h-[240px] w-auto object-contain drop-shadow-2xl"
          />
        </div>

        <div className="relative z-10 mt-auto">
          <p className="mb-2 font-semibold tracking-wider text-primary-foreground/70 uppercase">
            Online Voting System
          </p>
          <h1 className="text-4xl font-bold tracking-tight">
            Shape the Future of <br /> Philippine Advent College
          </h1>
          <p className="mt-4 max-w-lg text-lg text-primary-foreground/80">
            Secure, transparent, and fair student government elections. Your
            vote matters in building our community.
          </p>
        </div>
      </div>

      {/* right side - form */}
      <div className="flex items-center justify-center p-6 sm:p-8 lg:p-12">
        <div className="mx-auto flex w-full max-w-[360px] flex-col justify-center space-y-6 sm:max-w-[400px]">
          <div className="mb-2 flex justify-center lg:hidden">
            <img
              src="/images/pac-logo.svg"
              alt="PAC Logo"
              className="h-24 w-auto object-contain drop-shadow-md"
            />
          </div>

          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {title}
            </h1>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
