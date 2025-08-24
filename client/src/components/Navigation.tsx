import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

const navigationItems = [
  { href: "/", label: "Dashboard" },
  { href: "/start-sit", label: "Start/Sit" },
  { href: "/waivers", label: "Waivers" },
  { href: "/trade", label: "Trade" },
  { href: "/lineup", label: "Lineup" },
  { href: "/sos", label: "SoS" },
  { href: "/news", label: "News" },
];

export default function Navigation() {
  const [location] = useLocation();

  return (
    <nav className="bg-surface border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <i className="fas fa-football-ball text-primary text-xl"></i>
            <h1 className="text-xl font-bold text-slate-800">Fantasy Assistant</h1>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            {navigationItems.map(({ href, label }) => (
              <Link key={href} href={href}>
                <a
                  className={cn(
                    "transition-colors",
                    location === href
                      ? "text-primary font-medium"
                      : "text-slate-600 hover:text-primary"
                  )}
                  data-testid={`nav-${label.toLowerCase().replace("/", "-")}`}
                >
                  {label}
                </a>
              </Link>
            ))}
          </div>
          <button className="md:hidden p-2" data-testid="mobile-menu">
            <i className="fas fa-bars text-slate-600"></i>
          </button>
        </div>
      </div>
    </nav>
  );
}
