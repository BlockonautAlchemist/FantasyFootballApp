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
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-x-auto">
      <table className="w-full">
        <thead className="bg-white/10">
          <tr>
            <th className="text-left p-4 font-medium text-white">Position</th>
            {weeks.map(week => (
              <th key={week} className="text-center p-4 font-medium text-white">
                Week {week}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {positions.map(pos => (
            <tr key={pos}>
              <td className="p-4 font-medium text-white">{pos}</td>
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
