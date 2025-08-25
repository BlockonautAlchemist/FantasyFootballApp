import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import ConnectionCallout from "@/components/ConnectionCallout";
import { getNews } from "@/services/api";
import { NewsItem } from "@/services/types";

const newsFilters = ["All", "Injury", "Role", "Matchup", "Other"];

export default function News() {
  const [selectedFilter, setSelectedFilter] = useState("All");

  const { data: newsData, isLoading } = useQuery({
    queryKey: ["/api/news"],
    queryFn: () => getNews(),
  });

  const filteredNews = newsData?.filter(item => 
    selectedFilter === "All" || item.tag.toLowerCase() === selectedFilter.toLowerCase()
  );

  const getTagColor = (tag: string) => {
    switch (tag) {
      case "injury": return "bg-red-100 text-red-800";
      case "role": return "bg-blue-100 text-blue-800";
      case "matchup": return "bg-green-100 text-green-800";
      case "other": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case "High": return "fas fa-chart-line text-secondary";
      case "Medium": return "fas fa-chart-line text-warning";
      case "Low": return "fas fa-chart-line text-slate-400";
      default: return "fas fa-chart-line text-slate-400";
    }
  };

  return (
    <div>
      <PageHeader 
        title="Fantasy News" 
        subtitle="Latest updates and actionable insights" 
      />

      {/* Connection Status */}
      <div className="mb-6">
        <ConnectionCallout />
      </div>

      {/* News Filter */}
      <div className="bg-surface rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-slate-700">Filter by:</label>
          <div className="flex gap-2">
            {newsFilters.map((filter) => (
              <Button
                key={filter}
                variant={selectedFilter === filter ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter(filter)}
                data-testid={`filter-${filter.toLowerCase()}`}
              >
                {filter}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8" data-testid="loading-news">
          <i className="fas fa-spinner fa-spin text-2xl text-slate-400 mb-2"></i>
          <p className="text-slate-600">Loading latest news...</p>
        </div>
      ) : (
        <>
          {/* News Items */}
          <div className="space-y-4">
            {filteredNews?.map((item) => (
              <div 
                key={item.id} 
                className="bg-surface rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                data-testid={`news-item-${item.id}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className={`${getTagColor(item.tag)} text-xs px-2 py-1 rounded font-medium uppercase`}>
                      {item.tag}
                    </span>
                    {item.impact === "High" && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded font-medium">
                        URGENT
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-500">{item.timestamp}</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  {item.title}
                </h3>
                <p className="text-slate-600 mb-4">
                  {item.summary}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <i className={getImpactIcon(item.impact)}></i>
                    <span className="text-sm text-slate-600">Impact: {item.impact}</span>
                  </div>
                  {item.timeframe && (
                    <div className="flex items-center gap-2">
                      <i className="fas fa-clock text-slate-400 text-sm"></i>
                      <span className="text-sm text-slate-500">{item.timeframe}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-8">
            <Button variant="outline" data-testid="button-load-more">
              <i className="fas fa-plus mr-2"></i>
              Load More News
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
