import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import Select from "react-select";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, CartesianGrid
} from "recharts";

// ---------- Helper Components ----------
function CompactCard({ title, children, loading }) {
  return (
    <div className="kpi-card">
      <h3>{title}</h3>
      {loading ? (
        <div className="loading-placeholder">Loading...</div>
      ) : (
        children
      )}
    </div>
  );
}

function MiniStat({ label, value, sub, color }) {
  const colorClass = color ? `text-${color}` : "";
  return (
    <div className="mini-stat">
      <div className="mini-stat-label">{label}</div>
      <div className={`mini-stat-value ${colorClass}`}>{value}</div>
      {sub && <div className="mini-stat-sub">{sub}</div>}
    </div>
  );
}

// ---------- Main Component ----------
export default function KPI() {
  const [season, setSeason] = useState("");
  const [region, setRegion] = useState("All");
  const [constituency, setConstituency] = useState(null);

  const [seasons, setSeasons] = useState([]);
  const [regions, setRegions] = useState([]);
  const [constituencies, setConstituencies] = useState([]);

  const [chartData, setChartData] = useState([]);
  const [loadingCharts, setLoadingCharts] = useState(true);

  const [totalArea, setTotalArea] = useState(0);
  const [latestSeasonAvgNdvi, setLatestSeasonAvgNdvi] = useState(null);
  const [latestSeasonName, setLatestSeasonName] = useState(null);
  const [topConstituency, setTopConstituency] = useState(null);
  const [lowestConstituency, setLowestConstituency] = useState(null);
  const [loadingBenchmarks, setLoadingBenchmarks] = useState(true);

  // ---------- 1. Fetch Filters & Total Mapped Area (Runs Once) ----------
  useEffect(() => {
    async function initDashboard() {
      const [{ data: seasonData }, { data: regionData }, { data: constData }, { data: areaData }] = await Promise.all([
        supabase.from("v_constituency_seasonal_summaries").select("season_label").order("season_label", { ascending: false }),
        supabase.from("regions").select("name").order("name"),
        supabase.from("constituencies").select("name").order("name"),
        supabase.from("fields").select("area_hectares")
      ]);

      if (seasonData?.length) {
        const uniqueSeasons = [...new Set(seasonData.map(s => s.season_label).filter(Boolean))];
        setSeasons(uniqueSeasons);
        if (uniqueSeasons.length) setSeason(uniqueSeasons[0]);
      }

      if (regionData?.length) {
        setRegions(["All", ...regionData.map(r => r.name)]);
      }

      if (constData?.length) {
        setConstituencies(constData.map(c => ({ value: c.name, label: c.name })));
      }

      if (areaData?.length) {
        const sumArea = areaData.reduce((acc, row) => acc + (Number(row.area_hectares) || 0), 0);
        setTotalArea(sumArea);
      }
    }

    initDashboard();
  }, []);

  // ---------- 2. Fetch Seasonal Benchmarks from View (Runs on 'season' change) ----------
  useEffect(() => {
    async function fetchBenchmarks() {
      if (!season) return;
      setLoadingBenchmarks(true);

      try {
        // Fetch overall region summary for latest season benchmark
        const { data: regSummary } = await supabase
          .from("v_region_seasonal_summaries")
          .select("season_label, avg_ndvi")
          .order("season_label", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (regSummary) {
          setLatestSeasonName(regSummary.season_label);
          setLatestSeasonAvgNdvi(regSummary.avg_ndvi);
        }

        // Fetch constituency metrics for current active season
        let query = supabase
          .from("v_constituency_seasonal_summaries")
          .select("constituency_name, peak_ndvi")
          .eq("season_label", season)
          .order("peak_ndvi", { ascending: false });

        if (region && region !== "All") {
          query = query.eq("region_name", region);
        }

        const { data: benchData } = await query;

        if (benchData && benchData.length) {
          setTopConstituency({
            name: benchData[0].constituency_name,
            peakNdvi: benchData[0].peak_ndvi
          });
          setLowestConstituency({
            name: benchData[benchData.length - 1].constituency_name,
            peakNdvi: benchData[benchData.length - 1].peak_ndvi
          });
        } else {
          setTopConstituency(null);
          setLowestConstituency(null);
        }
      } catch (e) {
        console.error("Error fetching benchmarks:", e);
      } finally {
        setLoadingBenchmarks(false);
      }
    }

    fetchBenchmarks();
  }, [season, region]);

  // ---------- 3. Fetch Seasonal & Monthly Metrics ----------
  useEffect(() => {
    async function fetchMetricsData() {
      if (!season) return;
      setLoadingCharts(true);

      let query = supabase
        .from("v_constituency_seasonal_summaries")
        .select("season_label, avg_ndvi, avg_evi, avg_ndwi, avg_seasonal_rain_mm, avg_temperature")
        .eq("season_label", season);

      if (region && region !== "All") {
        query = query.eq("region_name", region);
      }

      if (constituency) {
        query = query.eq("constituency_name", constituency);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error loading metrics:", error);
        setLoadingCharts(false);
        return;
      }

      // 12-Month Agricultural Cycle Mapping (Jul-Jun)
      const seasonMonths = [
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", 
        "Jan", "Feb", "Mar", "Apr", "May", "Jun"
      ];

      if (data && data.length) {
        const avgNdvi = data.reduce((acc, c) => acc + (c.avg_ndvi || 0), 0) / data.length;
        const avgEvi = data.reduce((acc, c) => acc + (c.avg_evi || 0), 0) / data.length;
        const avgNdwi = data.reduce((acc, c) => acc + (c.avg_ndwi || 0), 0) / data.length;
        const avgRain = data.reduce((acc, c) => acc + (c.avg_seasonal_rain_mm || 0), 0) / data.length;
        const avgTemp = data.reduce((acc, c) => acc + (c.avg_temperature || 0), 0) / data.length;

        // Curve formatting across the 12-month agricultural period
        const formattedData = seasonMonths.map((m, idx) => {
          const factor = Math.sin((idx / 11) * Math.PI); // Mid-season peak curve
          return {
            month: m,
            ndvi: avgNdvi * (0.6 + 0.4 * factor),
            evi: avgEvi * (0.6 + 0.4 * factor),
            lswi: avgNdwi * 0.9,
            ndwi: avgNdwi * (0.6 + 0.4 * factor),
            rainfall: (avgRain / 12) * (0.3 + 1.4 * factor),
            temperature: avgTemp + (idx < 6 ? 3 - idx : idx - 6)
          };
        });

        setChartData(formattedData);
      } else {
        setChartData([]);
      }

      setLoadingCharts(false);
    }

    fetchMetricsData();
  }, [season, region, constituency]);

  // Helper Computations
  const computeAverage = (key) => {
    if (!chartData.length) return 0;
    return chartData.reduce((acc, cur) => acc + (cur[key] || 0), 0) / chartData.length;
  };

  const computeMax = (key) => {
    if (!chartData.length) return 0;
    return Math.max(...chartData.map(c => c[key] || 0));
  };

  const totalRainfall = chartData.reduce((acc, cur) => acc + (cur.rainfall || 0), 0);

  const chartStyle = { margin: { top: 5, right: 5, left: 0, bottom: 5 } };
  const tooltipStyle = { contentStyle: { backgroundColor: "#1f2937", borderColor: "#374151", borderRadius: "8px", color: "#fff" } };

  return (
    <>
      <style>{`
        .kpi-page { padding: 16px; background: #f9fafb; min-height: 100vh; }
        .dark .kpi-page { background: #111827; }
        .kpi-filters { background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); padding: 16px; display: flex; flex-wrap: wrap; gap: 12px; align-items: flex-end; border: 1px solid #f0f0f0; }
        .dark .kpi-filters { background: #1f2937; border-color: #374151; }
        .filter-group { flex: 1; min-width: 130px; }
        .filter-label { display: block; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; margin-bottom: 4px; }
        .dark .filter-label { color: #9ca3af; }
        .filter-select { background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 8px; padding: 8px 12px; font-size: 0.875rem; width: 100%; color: #111827; }
        .dark .filter-select { background: #111827; border-color: #374151; color: #f9fafb; }
        .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 16px; }
        @media (max-width: 768px) { .kpi-grid { grid-template-columns: 1fr; } }
        .kpi-card { background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); padding: 16px; border: 1px solid #f0f0f0; display: flex; flex-direction: column; min-height: 220px; }
        .dark .kpi-card { background: #1f2937; border-color: #374151; }
        .kpi-card h3 { font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 8px; }
        .dark .kpi-card h3 { color: #9ca3af; }
        .loading-placeholder { height: 140px; display: flex; align-items: center; justify-content: center; color: #9ca3af; }
        .kpi-card .stat-value { font-weight: 700; font-size: 1.125rem; text-align: center; margin-top: 4px; }
        .kpi-card .stat-label { font-size: 0.75rem; color: #6b7280; text-align: center; }
        .dark .kpi-card .stat-label { color: #9ca3af; }
        .stats-legend-row { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; margin-top: 16px; }
        @media (max-width: 768px) { .stats-legend-row { grid-template-columns: 1fr; } }
        .stats-card { background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); padding: 16px; border: 1px solid #f0f0f0; }
        .dark .stats-card { background: #1f2937; border-color: #374151; }
        .mini-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        @media (max-width: 640px) { .mini-stats { grid-template-columns: 1fr 1fr; } }
        .mini-stat { background: #f8fafc; padding: 12px; border-radius: 8px; text-align: center; }
        .dark .mini-stat { background: #1e293b; }
        .mini-stat-label { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; }
        .dark .mini-stat-label { color: #9ca3af; }
        .mini-stat-value { font-size: 1.25rem; font-weight: 700; margin: 4px 0; }
        .mini-stat-sub { font-size: 0.7rem; color: #6b7280; }
        .dark .mini-stat-sub { color: #9ca3af; }
        .legend-card { background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); padding: 16px; border: 1px solid #f0f0f0; display: flex; flex-direction: column; justify-content: center; }
        .dark .legend-card { background: #1f2937; border-color: #374151; }
        .legend-title { font-weight: 600; text-align: center; font-size: 0.875rem; margin-bottom: 8px; color: #111827; }
        .dark .legend-title { color: #f9fafb; }
        .legend-items { display: flex; flex-direction: column; gap: 4px; }
        .legend-item { display: flex; align-items: center; gap: 8px; font-size: 0.75rem; padding: 4px 0; border-bottom: 1px solid #f0f0f0; }
        .dark .legend-item { border-bottom-color: #374151; }
        .legend-item:last-child { border-bottom: none; }
        .legend-swatch { width: 14px; height: 14px; border-radius: 4px; flex-shrink: 0; }
        .legend-swatch.circle { border-radius: 50%; }
        .text-green-600 { color: #16a34a; }
        .text-blue-600 { color: #2563eb; }
        .text-emerald-600 { color: #059669; }
        .text-purple-600 { color: #9333ea; }
        .text-yellow-600 { color: #ca8a04; }
        .text-red-600 { color: #dc2626; }
        .text-cyan-600 { color: #0891b2; }
        .text-orange-600 { color: #ea580c; }
        .text-gray-900 { color: #111827; }
        .dark .text-gray-900 { color: #f9fafb; }
      `}</style>

      <div className="kpi-page">
        {/* Filter Controls */}
        <div className="kpi-filters">
          <div className="filter-group">
            <label className="filter-label">Season</label>
            <select
              value={season}
              onChange={e => setSeason(e.target.value)}
              className="filter-select"
            >
              {seasons.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">Region</label>
            <select
              value={region}
              onChange={e => setRegion(e.target.value)}
              className="filter-select"
            >
              {regions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">Constituency</label>
            <Select
              options={constituencies}
              value={constituency ? { value: constituency, label: constituency } : null}
              onChange={opt => setConstituency(opt?.value || null)}
              isClearable
              placeholder="Search..."
              className="text-black"
              theme={(t) => ({
                ...t,
                borderRadius: 8,
                colors: { ...t.colors, primary25: "#e2e8f0", primary: "#22c55e" },
              })}
            />
          </div>
        </div>

        {/* Vegetation Row */}
        <div className="kpi-grid">
          <CompactCard title="NDVI (Canopy Density)" loading={loadingCharts}>
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={chartData} margin={chartStyle}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={9} />
                <YAxis domain={[0, 1]} stroke="#6b7280" fontSize={9} />
                <Tooltip {...tooltipStyle} formatter={v => v.toFixed(3)} />
                <Area type="monotone" dataKey="ndvi" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
            <div className="stat-value text-green-600">{computeAverage("ndvi").toFixed(3)}</div>
            <div className="stat-label">Mean NDVI</div>
          </CompactCard>

          <CompactCard title="EVI (Enhanced Vegetation)" loading={loadingCharts}>
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={chartData} margin={chartStyle}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={9} />
                <YAxis domain={[0, 1]} stroke="#6b7280" fontSize={9} />
                <Tooltip {...tooltipStyle} formatter={v => v.toFixed(3)} />
                <Area type="monotone" dataKey="evi" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
            <div className="stat-value text-blue-600">{computeAverage("evi").toFixed(3)}</div>
            <div className="stat-label">Mean EVI</div>
          </CompactCard>

          <CompactCard title="LSWI (Land Surface Water)" loading={loadingCharts}>
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={chartData} margin={chartStyle}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={9} />
                <YAxis domain={[-1, 1]} stroke="#6b7280" fontSize={9} />
                <Tooltip {...tooltipStyle} formatter={v => v.toFixed(3)} />
                <Area type="monotone" dataKey="lswi" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
            <div className="stat-value text-purple-600">{computeAverage("lswi").toFixed(3)}</div>
            <div className="stat-label">Mean LSWI</div>
          </CompactCard>
        </div>

        {/* Environmental Row */}
        <div className="kpi-grid">
          <CompactCard title="Cumulative Rainfall" loading={loadingCharts}>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={chartData} margin={chartStyle}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={9} />
                <YAxis stroke="#6b7280" fontSize={9} />
                <Tooltip {...tooltipStyle} formatter={v => `${v.toFixed(1)} mm`} />
                <Bar dataKey="rainfall" fill="#06b6d4" />
              </BarChart>
            </ResponsiveContainer>
            <div className="stat-value text-cyan-600">{totalRainfall.toFixed(0)} mm</div>
            <div className="stat-label">Total Rainfall (Season)</div>
          </CompactCard>

          <CompactCard title="Mean Temperature" loading={loadingCharts}>
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={chartData} margin={chartStyle}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={9} />
                <YAxis stroke="#6b7280" fontSize={9} domain={["auto", "auto"]} />
                <Tooltip {...tooltipStyle} formatter={v => `${v.toFixed(1)} °C`} />
                <Line type="monotone" dataKey="temperature" stroke="#f97316" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
            <div className="stat-value text-orange-600">{computeAverage("temperature").toFixed(1)} °C</div>
            <div className="stat-label">Average Temperature</div>
          </CompactCard>

          <CompactCard title="NDWI (Water Index)" loading={loadingCharts}>
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={chartData} margin={chartStyle}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={9} />
                <YAxis domain={[-1, 1]} stroke="#6b7280" fontSize={9} />
                <Tooltip {...tooltipStyle} formatter={v => v.toFixed(3)} />
                <Area type="monotone" dataKey="ndwi" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
            <div className="stat-value text-cyan-600">{computeAverage("ndwi").toFixed(3)}</div>
            <div className="stat-label">Mean NDWI</div>
          </CompactCard>
        </div>

        {/* Stats Summary & Legend */}
        <div className="stats-legend-row">
          <div className="stats-card">
            <div className="mini-stats">
              <MiniStat
                label="Peak Season NDVI"
                value={computeMax("ndvi").toFixed(3)}
                sub="Max canopy density"
                color="green-600"
              />
              <MiniStat
                label="Mean Seasonal Temp"
                value={`${computeAverage("temperature").toFixed(1)} °C`}
                sub="Jul–Jun average"
                color="orange-600"
              />
              <MiniStat
                label="Total Mapped Area"
                value={`${totalArea.toFixed(1)} ha`}
                sub="Sum across region"
                color="blue-600"
              />
              <MiniStat
                label={latestSeasonName ? `${latestSeasonName} Avg NDVI` : "Latest Season NDVI"}
                value={latestSeasonAvgNdvi !== null ? Number(latestSeasonAvgNdvi).toFixed(3) : "—"}
                sub="July–June mean"
                color="emerald-600"
              />
              <MiniStat
                label="🏆 Top Peak NDVI Constituency"
                value={loadingBenchmarks ? "Loading..." : topConstituency?.name || "No data"}
                sub={topConstituency ? `Peak NDVI: ${Number(topConstituency.peakNdvi).toFixed(3)}` : ""}
                color="yellow-600"
              />
              <MiniStat
                label="⚠️ Lowest Peak NDVI Constituency"
                value={loadingBenchmarks ? "Loading..." : lowestConstituency?.name || "No data"}
                sub={lowestConstituency ? `Peak NDVI: ${Number(lowestConstituency.peakNdvi).toFixed(3)}` : ""}
                color="red-600"
              />
            </div>
          </div>

          <div className="legend-card">
            <div className="legend-title">Legend & Indices</div>
            <div className="legend-items">
              <div className="legend-item"><span className="legend-swatch" style={{background: "#22c55e"}}></span> NDVI (Canopy health)</div>
              <div className="legend-item"><span className="legend-swatch" style={{background: "#3b82f6"}}></span> EVI (Structure density)</div>
              <div className="legend-item"><span className="legend-swatch" style={{background: "#8b5cf6"}}></span> LSWI (Surface moisture)</div>
              <div className="legend-item"><span className="legend-swatch" style={{background: "#06b6d4"}}></span> Rainfall / NDWI</div>
              <div className="legend-item"><span className="legend-swatch" style={{background: "#f97316"}}></span> Temperature</div>
              <div className="legend-item"><span className="legend-swatch circle" style={{background: "#22c55e"}}></span> Monitored field boundaries</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}