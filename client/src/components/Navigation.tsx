import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

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
          <Link href="/" onClick={closeMobileMenu}>
            <motion.div 
              className="flex items-center space-x-3 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-semibold text-xl text-text">
                Nemetz's Fantasy App
              </span>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
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
                      "text-sm font-medium transition-colors cursor-pointer",
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
            className="md:hidden p-2 text-text hover:text-primary transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleMobileMenu}
            data-testid="mobile-menu"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </motion.button>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              className="md:hidden border-t border-border bg-bg/95 backdrop-blur-sm"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <div className="py-4 space-y-2">
                {navigationItems.map(({ href, label }, index) => (
                  <motion.div
                    key={href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ 
                      duration: 0.3, 
                      delay: index * 0.05,
                      ease: "easeOut" 
                    }}
                  >
                    <Link href={href} onClick={closeMobileMenu}>
                      <div
                        className={cn(
                          "px-4 py-3 text-sm font-medium transition-colors cursor-pointer hover:bg-surface2 rounded-lg mx-2",
                          location === href
                            ? "text-primary bg-primary/10"
                            : "text-textDim hover:text-text"
                        )}
                        data-testid={`mobile-nav-${label.toLowerCase()}`}
                      >
                        {label}
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
