'use client';

import React from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, LogOut, CreditCard, ChevronDown, Coins, Sparkles, Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function UserMenu() {
  const { data: session, status } = useSession();

  if (status === 'loading') return null;

  if (!session?.user) {
    return (
      <Link href="/auth/signin">
        <button className="h-10 px-6 bg-primary text-white font-black uppercase tracking-widest text-[0.65rem] rounded-full transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] font-heading">
          <span className="flex items-center gap-2">Initialize Link <User size={14} /></span>
        </button>
      </Link>
    );
  }

  const credits = (session.user as { credits?: number }).credits ?? 0;
  const initals = session.user.name?.substring(0, 2).toUpperCase() || session.user.email?.substring(0, 2).toUpperCase() || "??";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-3 bg-white/5 border border-white/10 p-1 pr-4 rounded-full transition-all hover:bg-white/10 hover:border-primary/50 group outline-none">
          <div>
            <Avatar className="h-8 w-8 rounded-full border border-white/10 transition-transform group-hover:scale-110">
              <AvatarImage src={session.user.image || ""} alt={session.user.name || "User avatar"} />
              <AvatarFallback className="bg-primary text-white text-[10px] font-black rounded-full uppercase">{initals}</AvatarFallback>
            </Avatar>
          </div>
          <div className="flex flex-col items-start text-left leading-none">
            <span className="text-[11px] font-black uppercase tracking-wider text-white truncate max-w-[100px]">{session.user.name || session.user.email?.split('@')[0]}</span>
            <span className="flex items-center gap-1.5 text-[10px] font-black text-primary">
              <Coins size={10} /> {credits} GRAVITY
            </span>
          </div>
          <ChevronDown size={14} className="text-zinc-400 transition-transform group-data-[state=open]:rotate-180" />
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-64 bg-zinc-950/95 backdrop-blur-3xl border-white/10 rounded-none p-2 shadow-2xl" align="end" sideOffset={12}>
        <DropdownMenuLabel className="px-3 py-4">
          <div className="flex flex-col space-y-1">
            <p className="text-xs font-black uppercase tracking-widest text-white">{session.user.name}</p>
            <p className="text-[11px] font-medium text-zinc-400 truncate">
              {session.user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator className="bg-white/5" />
        
        <DropdownMenuGroup>
          <div className="flex items-center justify-between px-3 py-3 bg-primary/5 border border-primary/10 my-1 rounded-xl">
            <span className="flex items-center text-[10px] font-black uppercase tracking-widest text-zinc-300">
              <CreditCard className="mr-2 h-4 w-4 text-primary" /> Gravity Essence
            </span>
            <span className="text-sm font-black italic text-primary">{credits} G</span>
          </div>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-white/5" />

        <DropdownMenuGroup className="space-y-1 py-1">
          <DropdownMenuItem asChild className="focus:bg-white/5 cursor-pointer rounded-none group">
            <Link href="/profile" className="flex items-center w-full px-3 py-2">
              <Settings className="mr-3 h-4 w-4 text-zinc-400 group-hover:text-primary transition-colors" />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-200 group-hover:text-white">Observatory Settings</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="focus:bg-primary focus:text-white cursor-pointer rounded-none group">
            <Link href="/dashboard?purchase=true" className="flex items-center w-full px-3 py-2">
              <Sparkles className="mr-3 h-4 w-4 text-primary group-focus:text-white transition-colors" />
              <span className="text-[10px] font-black uppercase tracking-widest">Gather Gravity</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator className="bg-white/5" />
        
        <DropdownMenuItem 
          onClick={() => signOut({ callbackUrl: '/auth/signin' })} 
          className="focus:bg-red-500/10 focus:text-red-400 cursor-pointer rounded-none px-3 py-2 group mt-1"
        >
          <LogOut className="mr-3 h-4 w-4 text-zinc-400 group-hover:text-red-400 transition-colors" />
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-200 group-hover:text-red-400">Exit Station</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
