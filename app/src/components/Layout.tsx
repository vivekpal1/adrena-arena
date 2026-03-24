import { Outlet, NavLink } from "react-router-dom";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import {
  Trophy,
  Layers,
  Bot,
  Swords,
  User,
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/", icon: Trophy, label: "Dashboard" },
  { to: "/leagues", icon: Layers, label: "Leagues" },
  { to: "/agents", icon: Bot, label: "AI Agents" },
  { to: "/tournaments", icon: Swords, label: "Tournaments" },
  { to: "/profile", icon: User, label: "Profile" },
] as const;

export function Layout() {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-arena-surface border-r border-arena-border flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-arena-border">
          <h1 className="text-xl font-bold">
            <span className="text-arena-accent">Adrena</span> Arena
          </h1>
          <p className="text-xs text-zinc-500 mt-1">Trading Competition</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-arena-accent/10 text-arena-accent"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Season Info */}
        <div className="p-4 border-t border-arena-border">
          <div className="card !p-3">
            <div className="text-xs text-zinc-500">Season 1 • Week 3</div>
            <div className="text-sm font-mono text-arena-accent mt-1">
              4d 12h remaining
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="h-16 border-b border-arena-border flex items-center justify-between px-6">
          <div />
          <WalletMultiButton />
        </header>

        {/* Page Content */}
        <div className="flex-1 p-6 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
