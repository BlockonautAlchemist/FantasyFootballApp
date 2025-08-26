import { motion } from "framer-motion";
import { Link } from "wouter";
import { 
  Scale, 
  Diamond, 
  Handshake, 
  BarChart3, 
  Calendar, 
  Newspaper, 
  Bot, 
  Link as LinkIcon 
} from "lucide-react";
import Reveal from "@/components/Reveal";
import Marquee from "@/components/Marquee";
import Parallax from "@/components/Parallax";
import MagneticButton from "@/components/MagneticButton";
import ConnectionCallout from "@/components/ConnectionCallout";
import VideoHero from "@/components/VideoHero";

const tools = [
  {
    title: "Start/Sit",
    description: "Compare players with AI-powered insights",
    href: "/start-sit",
    icon: Scale,
    gradient: "from-blue-600 to-purple-600"
  },
  {
    title: "Waivers",
    description: "Discover hidden gems on the wire",
    href: "/waivers",
    icon: Diamond,
    gradient: "from-emerald-600 to-teal-600"
  },
  {
    title: "Trade",
    description: "Analyze trades with precision",
    href: "/trade",
    icon: Handshake,
    gradient: "from-orange-600 to-red-600"
  },
  {
    title: "Lineup",
    description: "Optimize your starting lineup",
    href: "/lineup",
    icon: BarChart3,
    gradient: "from-pink-600 to-rose-600"
  },
  {
    title: "Schedule",
    description: "Plan ahead with matchup data",
    href: "/sos",
    icon: Calendar,
    gradient: "from-indigo-600 to-blue-600"
  },
  {
    title: "News",
    description: "Stay updated with the latest",
    href: "/news",
    icon: Newspaper,
    gradient: "from-yellow-600 to-orange-600"
  },
  {
    title: "Assistant",
    description: "Chat with your fantasy AI",
    href: "/chatbot",
    icon: Bot,
    gradient: "from-purple-600 to-pink-600"
  },
  {
    title: "Connect",
    description: "Link your Yahoo account",
    href: "/connect",
    icon: LinkIcon,
    gradient: "from-cyan-600 to-blue-600"
  }
];

export default function Dashboard() {
  return (
    <div>
      {/* Video Hero Section */}
      <VideoHero
        title="Your Fantasy Arsenal"
        subtitle="Eight powerful tools designed to give you the competitive edge you need to dominate your league."
        ctaText="Explore Tools"
        ctaHref="#tools"
        overlayOpacity={0.6}
      />

      {/* Connection Status */}
      <div className="mb-6">
        <ConnectionCallout />
      </div>

      {/* Tools Grid */}
      <section id="tools" className="py-32">
        <div className="container">
          <Reveal>
            <h2 className="mb-4 text-center">
              Your Fantasy Arsenal
            </h2>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="text-center text-textDim text-xl mb-20 max-w-2xl mx-auto">
              Eight powerful tools designed to give you the competitive edge you need 
              to dominate your league.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tools.map((tool, index) => (
              <Reveal key={tool.href} delay={0.1 * index}>
                <Link href={tool.href}>
                  <motion.div
                    className="group bg-surface border border-border rounded-2xl p-6 cursor-pointer card-magnetic"
                    whileHover={{ y: -8 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    data-testid={`tool-card-${tool.title.toLowerCase()}`}
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${tool.gradient} flex items-center justify-center mb-4 text-white`}>
                      <tool.icon size={24} />
                    </div>
                    
                    <h3 className="font-display font-semibold text-xl mb-2 text-text group-hover:text-textDim transition-colors">
                      {tool.title}
                    </h3>
                    
                    <p className="text-textDim text-sm leading-relaxed">
                      {tool.description}
                    </p>

                    <motion.div
                      className="mt-4 text-textDim group-hover:text-text transition-colors"
                      whileHover={{ x: 4 }}
                      transition={{ duration: 0.2 }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M5 12h14M12 5l7 7-7 7" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </motion.div>
                  </motion.div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Split */}
      <section className="py-32">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <Reveal>
              <div>
                <h2 className="mb-6">
                  Built for Champions
                </h2>
                <p className="text-textDim text-lg mb-8 leading-relaxed">
                  Every feature is crafted with one goal in mind: helping you make the decisions 
                  that win championships. From advanced player comparisons to real-time market 
                  analysis, we've got you covered.
                </p>
                <MagneticButton className="bg-surface border border-border text-text px-6 py-3 rounded-xl font-medium">
                  Learn More
                </MagneticButton>
              </div>
            </Reveal>

            <Parallax offset={30}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl blur-3xl" />
                <div className="relative bg-surface border border-border rounded-2xl p-8 backdrop-blur-sm">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-4">
                      <div className="text-3xl font-bold text-text mb-1">95%</div>
                      <div className="text-sm text-textDim">Accuracy Rate</div>
                    </div>
                    <div className="p-4">
                      <div className="text-3xl font-bold text-text mb-1">2.3x</div>
                      <div className="text-sm text-textDim">Win Rate Boost</div>
                    </div>
                    <div className="p-4">
                      <div className="text-3xl font-bold text-text mb-1">500K+</div>
                      <div className="text-sm text-textDim">Decisions Made</div>
                    </div>
                    <div className="p-4">
                      <div className="text-3xl font-bold text-text mb-1">#1</div>
                      <div className="text-sm text-textDim">Fantasy Tool</div>
                    </div>
                  </div>
                </div>
              </div>
            </Parallax>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative isolate">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_600px_at_50%_-10%,rgba(var(--accent),0.12),transparent_60%)]" />
        <div className="container text-center relative">
          <Reveal>
            <h2 className="mb-6">
              Ready to Dominate?
            </h2>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="text-textDim text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
              Join thousands of fantasy players who have already transformed their game 
              with our intelligent insights.
            </p>
          </Reveal>

          <Reveal delay={0.4}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/connect">
                <MagneticButton className="bg-primary text-white px-8 py-4 rounded-full font-display font-semibold text-lg">
                  Connect Yahoo Account
                </MagneticButton>
              </Link>
              <Link href="/start-sit">
                <MagneticButton className="bg-surface border border-border text-text px-8 py-4 rounded-full font-display font-semibold text-lg">
                  Try Start/Sit Tool
                </MagneticButton>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-border">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-mono text-textDim mb-4 md:mb-0">
              © 2024 Fantasy Assistant. All rights reserved.
            </div>
            <div className="flex space-x-6 text-textDim">
              <motion.a 
                href="#" 
                className="hover:text-text transition-colors"
                whileHover={{ scale: 1.1 }}
              >
                Twitter
              </motion.a>
              <motion.a 
                href="#" 
                className="hover:text-text transition-colors"
                whileHover={{ scale: 1.1 }}
              >
                Discord
              </motion.a>
              <motion.a 
                href="#" 
                className="hover:text-text transition-colors"
                whileHover={{ scale: 1.1 }}
              >
                GitHub
              </motion.a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}