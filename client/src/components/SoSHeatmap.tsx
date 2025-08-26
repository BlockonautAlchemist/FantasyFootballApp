import { SoSCell } from "@/services/types";

interface SoSHeatmapProps {
  data: SoSCell[];
  viewMode: "weekly" | "ros";
}

export default function SoSHeatmap({ data, viewMode }: SoSHeatmapProps) {
  const positions = ["QB", "RB", "WR", "TE"];
  const weeks = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];

  const getSoSClass = (strength: number) => {
    if (strength <= 2.0) return "sos-very-easy";
    if (strength <= 2.5) return "sos-easy";
    if (strength <= 3.5) return "sos-neutral";
    if (strength <= 4.0) return "sos-hard";
    return "sos-very-hard";
  };

  const getDataForCell = (pos: string, week: number) => {
    return data.find(cell => cell.pos === pos && cell.week === week);
  };

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-x-auto">
      <table className="w-full">
        <thead className="bg-surface2">
          <tr>
            <th className="text-left p-4 font-medium text-text">Position</th>
            {weeks.map(week => (
              <th key={week} className="text-center p-4 font-medium text-text">
                Week {week}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {positions.map(pos => (
            <tr key={pos}>
              <td className="p-4 font-medium text-text">{pos}</td>
              {weeks.map(week => {
                const cellData = getDataForCell(pos, week);
                const strength = cellData?.strength || 3.0;
                return (
                  <td key={`${pos}-${week}`} className="text-center p-4">
                    <div 
                      className={`${getSoSClass(strength)} rounded px-2 py-1 text-sm font-medium`}
                      data-testid={`sos-cell-${pos}-${week}`}
                    >
                      {strength.toFixed(1)}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
