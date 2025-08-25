import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/PageHeader";
import SoSHeatmap from "@/components/SoSHeatmap";
import Callout from "@/components/Callout";
import ConnectionCallout from "@/components/ConnectionCallout";
import { Button } from "@/components/ui/button";
import { getSoS } from "@/services/api";

export default function SoS() {
  const [viewMode, setViewMode] = useState<"weekly" | "ros">("weekly");

  const { data: sosData, isLoading } = useQuery({
    queryKey: ["/api/sos"],
    queryFn: () => getSoS(),
  });

  return (
    <div>
      <PageHeader 
        title="Strength of Schedule" 
        subtitle="View matchup difficulty by position and week" 
      />

      {/* Connection Status */}
      <div className="mb-6">
        <ConnectionCallout />
      </div>

      {/* Controls */}
      <div className="bg-surface rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-slate-700">View:</label>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "weekly" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("weekly")}
                data-testid="button-weekly-view"
              >
                Weekly
              </Button>
              <Button
                variant={viewMode === "ros" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("ros")}
                data-testid="button-ros-view"
              >
                Rest of Season
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">Legend:</span>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-4 h-4 sos-very-easy rounded"></div>
              <span>Very Easy</span>
              <div className="w-4 h-4 sos-easy rounded"></div>
              <span>Easy</span>
              <div className="w-4 h-4 sos-neutral rounded"></div>
              <span>Neutral</span>
              <div className="w-4 h-4 sos-hard rounded"></div>
              <span>Hard</span>
              <div className="w-4 h-4 sos-very-hard rounded"></div>
              <span>Very Hard</span>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8" data-testid="loading-sos">
          <i className="fas fa-spinner fa-spin text-2xl text-slate-400 mb-2"></i>
          <p className="text-slate-600">Loading strength of schedule data...</p>
        </div>
      ) : sosData ? (
        <>
          {/* SoS Heatmap */}
          <div className="mb-6">
            <SoSHeatmap data={sosData} viewMode={viewMode} />
          </div>

          {/* SoS Insights */}
          <div className="bg-surface rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Key Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Callout variant="success" icon="fas fa-thumbs-up" title="Favorable Matchups">
                <ul className="text-sm space-y-1">
                  <li>• WRs have soft Week 10-11 stretch</li>
                  <li>• TEs face weak coverage Week 8</li>
                  <li>• RBs get relief Week 11-13</li>
                </ul>
              </Callout>
              
              <Callout variant="error" icon="fas fa-exclamation-triangle" title="Tough Weeks Ahead">
                <ul className="text-sm space-y-1">
                  <li>• RB nightmare in Week 9</li>
                  <li>• QB struggles Week 14</li>
                  <li>• WR challenges Week 15</li>
                </ul>
              </Callout>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
