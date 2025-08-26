import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const navigationItems = [
  { href: "/", label: "Home" },
  { href: "/start-sit", label: "Start/Sit" },
  { href: "/waivers", label: "Waivers" },
  { href: "/trade", label: "Trade" },
  { href: "/lineup", label: "Lineup" },
  { href: "/sos", label: "Schedule" },
  { href: "/news", label: "News" },
  { href: "/chatbot", label: "Assistant" },
  { href: "/connect", label: "Connect" },
];

export default function Navigation() {
  const [location] = useLocation();

  return (
    <motion.nav 
      className="fixed top-0 left-0 right-0 z-50 bg-bg/90 backdrop-blur supports-[backdrop-filter]:bg-bg/70 border-b border-border"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="container">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/">
            <motion.div 
              className="flex items-center space-x-3 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <span className="font-display font-semibold text-xl text-text">
                Fantasy
              </span>
            </motion.div>
          </Link>

          {/* Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map(({ href, label }, index) => (
              <motion.div
                key={href}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.6, 
                  delay: 0.1 + index * 0.05,
                  ease: "easeOut" 
                }}
              >
                <Link href={href}>
                  <span
                    className={cn(
                      "link-underline text-sm font-medium transition-colors cursor-pointer",
                      location === href
                        ? "text-text"
                        : "text-textDim hover:text-text"
                    )}
                    data-testid={`nav-${label.toLowerCase()}`}
                  >
                    {label}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <motion.button 
            className="md:hidden p-2 text-text"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            data-testid="mobile-menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M3 6h18M3 12h18M3 18h18" strokeWidth={2} strokeLinecap="round"/>
            </svg>
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
}
