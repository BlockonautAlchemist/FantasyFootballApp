import { motion } from "framer-motion";
import { Link } from "wouter";
import Reveal from "@/components/Reveal";
import Marquee from "@/components/Marquee";
import Parallax from "@/components/Parallax";
import MagneticButton from "@/components/MagneticButton";
import ConnectionCallout from "@/components/ConnectionCallout";

const tools = [
  {
    title: "Start/Sit",
    description: "Compare players with AI-powered insights",
    href: "/start-sit",
    icon: "⚖️",
    gradient: "from-blue-600 to-purple-600"
  },
  {
    title: "Waivers",
    description: "Discover hidden gems on the wire",
    href: "/waivers",
    icon: "💎",
    gradient: "from-emerald-600 to-teal-600"
  },
  {
    title: "Trade",
    description: "Analyze trades with precision",
    href: "/trade",
    icon: "🤝",
    gradient: "from-orange-600 to-red-600"
  },
  {
    title: "Lineup",
    description: "Optimize your starting lineup",
    href: "/lineup",
    icon: "📊",
    gradient: "from-pink-600 to-rose-600"
  },
  {
    title: "Schedule",
    description: "Plan ahead with matchup data",
    href: "/sos",
    icon: "📅",
    gradient: "from-indigo-600 to-blue-600"
  },
  {
    title: "News",
    description: "Stay updated with the latest",
    href: "/news",
    icon: "📰",
    gradient: "from-yellow-600 to-orange-600"
  },
  {
    title: "Assistant",
    description: "Chat with your fantasy AI",
    href: "/chatbot",
    icon: "🤖",
    gradient: "from-purple-600 to-pink-600"
  },
  {
    title: "Connect",
    description: "Link your Yahoo account",
    href: "/connect",
    icon: "🔗",
    gradient: "from-cyan-600 to-blue-600"
  }
];

export default function Dashboard() {
  return (
    <>
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Radial Gradient Background Overlay */}
        <div className="absolute inset-0 bg-gradient-radial from-indigo-500/20 via-purple-500/10 to-transparent" />
        
        {/* Background Parallax Element */}
        <Parallax offset={100} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5">
          <div className="w-[800px] h-[800px] rounded-full bg-gradient-to-r from-white to-gray-300" />
        </Parallax>

        <div className="container relative z-10 text-center">
          <Reveal>
            <motion.h1 
              className="mb-8 leading-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
              animate={{ 
                textShadow: "0px 0px 20px rgba(128,0,255,0.6)" 
              }}
              transition={{
                textShadow: {
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut"
                }
              }}
            >
              Fantasy Football
              <br />
              Reimagined
            </motion.h1>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              AI-powered insights, real-time analysis, and championship-winning strategies 
              all in one beautiful interface.
            </p>
          </Reveal>

          <Reveal delay={0.4}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <Link href="#tools">
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-full px-6 py-3 shadow-lg transition-all duration-300 relative overflow-hidden group">
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  
                  <span className="relative z-10">Explore Tools</span>
                  <motion.div
                    className="relative z-10"
                    animate={{ y: [0, 4, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M7 13l3 3 7-7" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </motion.div>
                </div>
              </Link>
            </motion.div>
          </Reveal>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-500"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M7 13l3 3 7-7" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.div>
      </section>

      {/* Marquee Section */}
      <section className="py-8 border-y border-white/10 bg-white/5">
        <Marquee className="text-6xl md:text-8xl font-display font-bold text-white/10">
          DOMINATE YOUR LEAGUE • WIN CHAMPIONSHIPS • ANALYZE EVERYTHING • 
        </Marquee>
      </section>

      {/* Connection Status */}
      <section className="py-16">
        <div className="container">
          <ConnectionCallout />
        </div>
      </section>

      {/* Tools Grid */}
      <section id="tools" className="py-32">
        <div className="container">
          <Reveal>
            <h2 className="mb-4 text-center">
              Your Fantasy Arsenal
            </h2>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="text-center text-gray-400 text-xl mb-20 max-w-2xl mx-auto">
              Eight powerful tools designed to give you the competitive edge you need 
              to dominate your league.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tools.map((tool, index) => (
              <Reveal key={tool.href} delay={0.1 * index}>
                <Link href={tool.href}>
                  <motion.div
                    className="group bg-white/5 border border-white/10 rounded-2xl p-6 cursor-pointer card-magnetic"
                    whileHover={{ y: -8 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    data-testid={`tool-card-${tool.title.toLowerCase()}`}
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${tool.gradient} flex items-center justify-center mb-4 text-xl`}>
                      {tool.icon}
                    </div>
                    
                    <h3 className="font-display font-semibold text-xl mb-2 text-white group-hover:text-gray-200 transition-colors">
                      {tool.title}
                    </h3>
                    
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {tool.description}
                    </p>

                    <motion.div
                      className="mt-4 text-gray-500 group-hover:text-white transition-colors"
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
                <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                  Every feature is crafted with one goal in mind: helping you make the decisions 
                  that win championships. From advanced player comparisons to real-time market 
                  analysis, we've got you covered.
                </p>
                <MagneticButton className="bg-white/10 border border-white/20 text-white px-6 py-3 rounded-xl font-medium">
                  Learn More
                </MagneticButton>
              </div>
            </Reveal>

            <Parallax offset={30}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl blur-3xl" />
                <div className="relative bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-4">
                      <div className="text-3xl font-bold text-white mb-1">95%</div>
                      <div className="text-sm text-gray-400">Accuracy Rate</div>
                    </div>
                    <div className="p-4">
                      <div className="text-3xl font-bold text-white mb-1">2.3x</div>
                      <div className="text-sm text-gray-400">Win Rate Boost</div>
                    </div>
                    <div className="p-4">
                      <div className="text-3xl font-bold text-white mb-1">500K+</div>
                      <div className="text-sm text-gray-400">Decisions Made</div>
                    </div>
                    <div className="p-4">
                      <div className="text-3xl font-bold text-white mb-1">#1</div>
                      <div className="text-sm text-gray-400">Fantasy Tool</div>
                    </div>
                  </div>
                </div>
              </div>
            </Parallax>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 grain bg-gradient-to-r from-white/5 to-gray-800/5">
        <div className="container text-center">
          <Reveal>
            <h2 className="mb-6">
              Ready to Dominate?
            </h2>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="text-gray-400 text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
              Join thousands of fantasy players who have already transformed their game 
              with our intelligent insights.
            </p>
          </Reveal>

          <Reveal delay={0.4}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/connect">
                <MagneticButton className="bg-white text-black px-8 py-4 rounded-full font-display font-semibold text-lg">
                  Connect Yahoo Account
                </MagneticButton>
              </Link>
              <Link href="/start-sit">
                <MagneticButton className="bg-white/10 border border-white/20 text-white px-8 py-4 rounded-full font-display font-semibold text-lg">
                  Try Start/Sit Tool
                </MagneticButton>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-white/10">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-mono text-gray-500 mb-4 md:mb-0">
              © 2024 Fantasy Assistant. All rights reserved.
            </div>
            <div className="flex space-x-6 text-gray-500">
              <motion.a 
                href="#" 
                className="hover:text-white transition-colors"
                whileHover={{ scale: 1.1 }}
              >
                Twitter
              </motion.a>
              <motion.a 
                href="#" 
                className="hover:text-white transition-colors"
                whileHover={{ scale: 1.1 }}
              >
                Discord
              </motion.a>
              <motion.a 
                href="#" 
                className="hover:text-white transition-colors"
                whileHover={{ scale: 1.1 }}
              >
                GitHub
              </motion.a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}