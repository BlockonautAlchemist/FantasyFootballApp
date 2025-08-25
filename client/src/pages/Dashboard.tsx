import { Link } from "wouter";
import PageHeader from "@/components/PageHeader";
import ConnectionCallout from "@/components/ConnectionCallout";

const quickActions = [
  {
    title: "Start/Sit",
    description: "Compare two players and get data-driven recommendations",
    icon: "fas fa-balance-scale",
    href: "/start-sit",
    bgColor: "bg-primary/10",
    iconColor: "text-primary",
    badge: "WEEKLY",
    badgeColor: "text-slate-500 bg-slate-100",
    lastUsed: "Last used: Waddle vs Sutton"
  },
  {
    title: "Waivers",
    description: "Find the best available pickups with FAAB guidance",
    icon: "fas fa-plus-circle",
    href: "/waivers",
    bgColor: "bg-secondary/10",
    iconColor: "text-secondary",
    badge: "5 TARGETS",
    badgeColor: "text-emerald-600 bg-emerald-100",
    lastUsed: "Top target: Jordan Addison"
  },
  {
    title: "Trade Analyzer",
    description: "Evaluate trade offers with value and risk analysis",
    icon: "fas fa-exchange-alt",
    href: "/trade",
    bgColor: "bg-warning/10",
    iconColor: "text-warning",
    badge: "ANALYZER",
    badgeColor: "text-slate-500 bg-slate-100",
    lastUsed: "Ready to analyze"
  },
  {
    title: "Lineup",
    description: "Get optimal starting lineup with pivot suggestions",
    icon: "fas fa-users",
    href: "/lineup",
    bgColor: "bg-purple-500/10",
    iconColor: "text-purple-500",
    badge: "OPTIMIZE",
    badgeColor: "text-slate-500 bg-slate-100",
    lastUsed: "Lineup set for Week 8"
  },
  {
    title: "Strength of Schedule",
    description: "View matchup difficulty heatmaps by position",
    icon: "fas fa-calendar-alt",
    href: "/sos",
    bgColor: "bg-red-500/10",
    iconColor: "text-red-500",
    badge: "SCHEDULE",
    badgeColor: "text-slate-500 bg-slate-100",
    lastUsed: "RBs have tough Week 9"
  },
  {
    title: "News & Updates",
    description: "Latest injury reports and role changes",
    icon: "fas fa-newspaper",
    href: "/news",
    bgColor: "bg-blue-500/10",
    iconColor: "text-blue-500",
    badge: "3 URGENT",
    badgeColor: "text-red-600 bg-red-100",
    lastUsed: "Updated 2 minutes ago"
  }
];

export default function Dashboard() {
  return (
    <div>
      <PageHeader 
        title="Dashboard" 
        subtitle="Your fantasy football command center for Week 8" 
      />

      {/* Connection Status */}
      <div className="mb-6">
        <ConnectionCallout />
      </div>

      {/* This Week Callout */}
      <div className="bg-gradient-to-r from-primary to-blue-600 text-white rounded-lg p-6 mb-8">
        <h3 className="text-xl font-semibold mb-3">
          <i className="fas fa-star mr-2"></i>
          This Week's Top Recommendation
        </h3>
        <div className="bg-white/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Start/Sit Confidence: 78%</p>
              <p className="text-lg font-medium">Start Jaylen Waddle over Courtland Sutton</p>
              <p className="text-sm opacity-90">Higher target share vs weaker secondary</p>
            </div>
            <Link href="/start-sit">
              <button 
                className="bg-white text-primary px-4 py-2 rounded font-medium hover:bg-gray-50 transition-colors"
                data-testid="button-view-details"
              >
                View Details
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {quickActions.map((action, index) => (
          <Link key={action.href} href={action.href}>
            <div 
              className="bg-surface rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
              data-testid={`card-${action.title.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${action.bgColor} p-3 rounded-lg`}>
                  <i className={`${action.icon} ${action.iconColor} text-xl`}></i>
                </div>
                <span className={`text-xs font-medium ${action.badgeColor} px-2 py-1 rounded`}>
                  {action.badge}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">{action.title}</h3>
              <p className="text-slate-600 text-sm mb-4">{action.description}</p>
              <div className="text-xs text-slate-500">
                <span className="flex items-center">
                  <i className="fas fa-chart-line mr-1"></i>
                  {action.lastUsed}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
