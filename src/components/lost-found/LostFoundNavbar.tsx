"use client";

import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/BackButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Sparkles, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { Session } from "next-auth";
import { usePathname } from "next/navigation";

interface LostFoundNavbarProps {
    session: Session | null;
}

export function LostFoundNavbar({ session }: LostFoundNavbarProps) {
    const pathname = usePathname();
    return (
        <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/50 backdrop-blur-xl">
            <div className="container flex h-16 items-center px-4 sm:px-8 max-w-7xl mx-auto relative justify-between">
                {/* Left Side - Back Link */}
                <div className="flex items-center">
                    {/* Dynamic Back Button Logic */}
                    {pathname === "/lost-found" ? (
                        <BackButton fallbackRoute="/dashboard" className="text-sm font-medium">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            <span className="hidden sm:inline">Back to Dashboard</span>
                            <span className="sm:hidden">Back</span>
                        </BackButton>
                    ) : (
                        <BackButton fallbackRoute="/lost-found" className="text-sm font-medium">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            <span className="hidden sm:inline">Back to Lost & Found</span>
                            <span className="sm:hidden">Back</span>
                        </BackButton>
                    )}
                </div>

                {/* Center - Brand */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="p-1.5 bg-amber-900/20 border border-amber-500/20 rounded-md group-hover:bg-amber-900/30 transition-colors">
                            <Shield className="w-5 h-5 text-amber-500" />
                        </div>
                        <span className="font-black uppercase tracking-widest text-sm text-white hidden sm:block">
                            Campus Vault
                        </span>
                    </Link>
                </div>

                {/* Right Side - User Actions */}
                <div className="ml-auto flex items-center gap-4">
                    {session ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-8 w-8 rounded-full ring-2 ring-white/10 hover:ring-white/20 transition-all">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={session.user?.image || "/avatars/01.png"} alt={session.user?.name || "@user"} />
                                        <AvatarFallback className="bg-zinc-800 text-zinc-400">
                                            {session.user?.name?.slice(0, 2).toUpperCase() || "CV"}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56 bg-black/90 border-white/10 text-zinc-400" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none text-white">{session.user?.name}</p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {session.user?.email}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-white/10" />
                                <DropdownMenuItem className="focus:bg-white/10 focus:text-white cursor-pointer" asChild>
                                    <Link href="/dashboard/profile">
                                        <User className="mr-2 h-4 w-4" />
                                        <span>Profile</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="focus:bg-white/10 focus:text-white cursor-pointer" asChild>
                                    <Link href="/dashboard/karma">
                                        <Sparkles className="mr-2 h-4 w-4" />
                                        <span>Karma</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-white/10" />
                                <DropdownMenuItem className="text-red-500 focus:bg-red-900/20 focus:text-red-400 cursor-pointer" onClick={() => signOut({ callbackUrl: "/" })}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link href="/sign-in">
                                <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-white/10">
                                    Sign In
                                </Button>
                            </Link>
                            <Link href="/sign-up">
                                <Button className="bg-white text-black hover:bg-zinc-200 font-bold">
                                    Get Started
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
