import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import jStat from 'jstat'
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, ZAxis,
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie, Cell
} from 'recharts'

// ---------- Inline Styles ----------
const styles = {
  page: { padding: '24px', backgroundColor: '#f9fafb', minHeight: '100vh', display: 'flex', flexDirection: 'column' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  title: { fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' },
  contentContainer: { display: 'flex', gap: '24px', flexWrap: 'wrap' },
  leftCol: { flex: 2, display: 'flex', flexDirection: 'column', gap: '24px', minWidth: '300px' },
  rightCol: { flex: 1, display: 'flex', flexDirection: 'column', gap: '24px', minWidth: '250px' },
  card: {
    backgroundColor: '#fff', borderRadius: '12px', padding: '16px',
    border: '1px solid #f0f0f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  chartTitle: { fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '8px' },
  controlGroup: { display: 'flex', alignItems: 'center', gap: '4px' },
  controlLabel: { fontSize: '0.7rem', fontWeight: 600, color: '#6b7280' },
  controlSelect: {
    padding: '2px 6px', borderRadius: '4px', border: '1px solid #d1d5db',
    background: '#f9fafb', fontSize: '0.75rem', color: '#111827'
  },
  tableWrap: { overflow: 'auto', maxHeight: '300px' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' },
  th: { textAlign: 'left', padding: '4px 6px', borderBottom: '2px solid #e5e7eb', position: 'sticky', top: 0, background: '#fff' },
  td: { padding: '4px 6px', borderBottom: '1px solid #f3f4f6' },
  noData: { textAlign: 'center', padding: '20px', color: '#6b7280', fontSize: '0.9rem' },
  statRow: { display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f3f4f6' },
  statLabel: { fontSize: '0.7rem', color: '#6b7280' },
  statValue: { fontSize: '0.7rem', fontWeight: 600 },
  builderControls: { display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '12px', alignItems: 'center' },
  builderSelect: {
    padding: '4px 8px', borderRadius: '4px', border: '1px solid #d1d5db',
    background: '#f9fafb', fontSize: '0.75rem', color: '#111827', minWidth: '120px'
  },
  multiSelectContainer: { position: 'relative', display: 'inline-block' },
  multiSelectButton: {
    padding: '4px 8px', borderRadius: '4px', border: '1px solid #d1d5db',
    background: '#f9fafb', fontSize: '0.75rem', color: '#111827', cursor: 'pointer',
    minWidth: '120px', textAlign: 'left'
  },
  multiSelectDropdown: {
    position: 'absolute', top: '100%', left: 0, marginTop: '4px',
    backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '4px',
    padding: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 10,
    minWidth: '160px', maxHeight: '200px', overflowY: 'auto'
  },
  checkboxItem: { display: 'flex', alignItems: 'center', gap: '6px', padding: '2px 4px', cursor: 'pointer' },
  checkboxLabel: { fontSize: '0.7rem', color: '#111827' },
  testBtn: {
    backgroundColor: '#8b5cf6', color: '#fff', border: 'none',
    padding: '6px 16px', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer',
    marginTop: '8px'
  },
  topControls: { display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' },
  footer: { marginTop: '24px', fontSize: '0.75rem', color: '#9ca3af', textAlign: 'center' },
  modalOverlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    zIndex: 1000
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '24px',
    maxWidth: '90vw',
    maxHeight: '80vh',
    overflow: 'auto',
    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
    width: '1000px'
  },
  modalHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '16px'
  },
  modalTitle: { fontSize: '1.25rem', fontWeight: 'bold', color: '#111827' },
  closeBtn: { background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#6b7280' },
  exportBtn: {
    backgroundColor: '#10b981', color: '#fff', border: 'none',
    padding: '4px 12px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer'
  },
  resultTable: { width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', marginBottom: '16px' },
  resultTh: { textAlign: 'left', padding: '6px 8px', borderBottom: '2px solid #e5e7eb', fontWeight: 600 },
  resultTd: { padding: '4px 8px', borderBottom: '1px solid #f3f4f6' },
  sectionTitle: { fontSize: '0.9rem', fontWeight: 600, marginTop: '12px', marginBottom: '8px', color: '#374151' }
}

export default function Exploratory() {
  const navigate = useNavigate()

  // ---------- State ----------
  const [seasons, setSeasons] = useState([])
  const [selectedSeason, setSelectedSeason] = useState('')

  const [allData, setAllData] = useState([])
  const [loading, setLoading] = useState(true)

  // Chart builder controls
  const [xVar, setXVar] = useState('avg_ndvi')
  const [yVar, setYVar] = useState('avg_evi')
  const [colorBy, setColorBy] = useState('region')

  const [chartType, setChartType] = useState('bar')
  const [selectedVars, setSelectedVars] = useState(['avg_ndvi', 'avg_evi'])
  const [category, setCategory] = useState('constituency')
  const [showVarDropdown, setShowVarDropdown] = useState(false)

  // Top constituencies control
  const [topMetric, setTopMetric] = useState('avg_ndvi')

  // Evaluation modal
  const [showEvaluation, setShowEvaluation] = useState(false)
  const [evalResults, setEvalResults] = useState(null)
  const [exportFormat, setExportFormat] = useState('csv')

  // ---------- Constants ----------
  const numericVars = [
    'avg_ndvi', 'avg_evi', 'avg_ndwi', 'avg_bsi',
    'estimated_yield', 'total_seasonal_rain', 'avg_seasonal_temp'
  ]
  const colorOptions = ['region', 'constituency']
  const categoricalVars = ['constituency', 'region']
  const chartTypes = ['bar', 'line', 'area', 'radar', 'pie', 'donut', 'histogram', 'scatter', 'bubble']
  const COLORS = ['#22c55e', '#3b82f6', '#ef4444', '#eab308', '#8b5cf6', '#06b6d4', '#f472b6', '#f59e0b', '#10b981', '#6366f1']

  // ---------- Fetch seasons ----------
  useEffect(() => {
    async function fetchSeasons() {
      try {
        const { data, error } = await supabase
          .from('field_seasons')
          .select('season_label')
          .not('season_label', 'is', null)
          .order('season_label', { ascending: false })
        if (error) throw error
        if (data && data.length) {
          const unique = [...new Set(data.map(d => d.season_label))]
          setSeasons(unique)
          if (unique.length) {
            setSelectedSeason(unique[0])
          }
        } else {
          setSeasons(['2025-2026', '2024-2025', '2020-2021'])
          setSelectedSeason('2025-2026')
        }
      } catch (e) {
        console.warn('Error fetching seasons:', e.message)
        setSeasons(['2025-2026', '2024-2025', '2020-2021'])
        setSelectedSeason('2025-2026')
      }
    }
    fetchSeasons()
  }, [])

  // ---------- Fetch main data from field_seasons ----------
  useEffect(() => {
    if (!selectedSeason) return
    setLoading(true)

    async function fetchData() {
      let query = supabase
        .from('field_seasons')
        .select(`
          uniq_field_id,
          avg_ndvi,
          max_ndvi,
          avg_evi,
          avg_ndwi,
          avg_bsi,
          estimated_yield,
          total_seasonal_rain,
          avg_seasonal_temp,
          fields!inner (
            region,
            constituency
          )
        `)
        .eq('season_label', selectedSeason)

      const { data, error } = await query
      if (error) {
        console.error('Error fetching exploratory data:', error)
        setLoading(false)
        return
      }

      const transformed = data.map(row => ({
        ...row,
        region: row.fields.region,
        constituency: row.fields.constituency,
      }))
      setAllData(transformed)
      setLoading(false)
    }

    fetchData()
  }, [selectedSeason])

  // ---------- Correlation matrix ----------
  const computeCorrelations = () => {
    if (allData.length === 0) return { matrix: [], vars: [] }
    const keys = numericVars
    const matrix = keys.map(() => Array(keys.length).fill(0))
    for (let i = 0; i < keys.length; i++) {
      for (let j = i; j < keys.length; j++) {
        if (i === j) { matrix[i][j] = 1; continue }
        const xKey = keys[i], yKey = keys[j]
        const pairs = allData
          .filter(d => d[xKey] !== null && d[xKey] !== undefined && d[yKey] !== null && d[yKey] !== undefined)
          .map(d => ({ x: d[xKey], y: d[yKey] }))
        if (pairs.length < 2) { matrix[i][j] = 0; matrix[j][i] = 0; continue }
        const n = pairs.length
        const sumX = pairs.reduce((a, p) => a + p.x, 0)
        const sumY = pairs.reduce((a, p) => a + p.y, 0)
        const sumXY = pairs.reduce((a, p) => a + p.x * p.y, 0)
        const sumX2 = pairs.reduce((a, p) => a + p.x * p.x, 0)
        const sumY2 = pairs.reduce((a, p) => a + p.y * p.y, 0)
        const corr = (n * sumXY - sumX * sumY) / Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))
        matrix[i][j] = isNaN(corr) ? 0 : corr
        matrix[j][i] = matrix[i][j]
      }
    }
    return { matrix, vars: keys }
  }

  const { matrix, vars } = computeCorrelations()

  // ---------- Summary statistics ----------
  const computeStats = () => {
    const stats = {}
    numericVars.forEach(key => {
      const vals = allData.map(d => d[key]).filter(v => v !== null && v !== undefined)
      if (vals.length === 0) {
        stats[key] = { count: 0, mean: 0, min: 0, max: 0, std: 0 }
        return
      }
      const count = vals.length
      const sum = vals.reduce((a, b) => a + b, 0)
      const mean = sum / count
      const min = Math.min(...vals)
      const max = Math.max(...vals)
      const variance = vals.reduce((a, b) => a + (b - mean) ** 2, 0) / count
      const std = Math.sqrt(variance)
      stats[key] = { count, mean, min, max, std }
    })
    return stats
  }
  const stats = computeStats()

  // ---------- Top constituencies data ----------
  const getTopData = () => {
    if (allData.length === 0) return []
    const grouped = {}
    allData.forEach(row => {
      const cat = row.constituency || 'Unknown'
      if (!grouped[cat]) grouped[cat] = { sum: 0, count: 0 }
      const val = row[topMetric]
      if (val !== null && val !== undefined) {
        grouped[cat].sum += val
        grouped[cat].count++
      }
    })
    const result = Object.entries(grouped)
      .map(([name, vals]) => ({
        constituency: name,
        value: vals.count ? vals.sum / vals.count : 0
      }))
      .sort((a, b) => b.value - a.value)
    return result
  }
  const topData = getTopData()

  // ---------- Chart builder data ----------
  const getBuilderData = () => {
    if (allData.length === 0) return { data: [], keys: [] }

    const catKey = category || 'constituency'

    // Bar/line/area/radar – multiple variables
    if (['bar', 'line', 'area', 'radar'].includes(chartType)) {
      const groups = {}
      allData.forEach(row => {
        const cat = row[catKey] || 'Unknown'
        if (!groups[cat]) groups[cat] = { count: 0, sums: {} }
        groups[cat].count++
        selectedVars.forEach(v => {
          const val = row[v]
          if (val !== null && val !== undefined) {
            if (!groups[cat].sums[v]) groups[cat].sums[v] = 0
            groups[cat].sums[v] += val
          }
        })
      })
      const result = Object.entries(groups).map(([cat, val]) => {
        const row = { category: cat }
        selectedVars.forEach(v => {
          row[v] = val.sums[v] ? val.sums[v] / val.count : 0
        })
        return row
      })
      return { data: result, keys: selectedVars }
    }

    // Pie/donut – single variable
    if (['pie', 'donut'].includes(chartType)) {
      const varName = selectedVars[0] || 'avg_ndvi'
      const groups = {}
      allData.forEach(row => {
        const cat = row[catKey] || 'Unknown'
        if (!groups[cat]) groups[cat] = { sum: 0, count: 0 }
        const val = row[varName]
        if (val !== null && val !== undefined) {
          groups[cat].sum += val
          groups[cat].count++
        }
      })
      const result = Object.entries(groups).map(([cat, val]) => ({
        category: cat,
        value: val.count ? val.sum / val.count : 0
      }))
      return { data: result, keys: ['value'] }
    }

    // Histogram – single variable
    if (chartType === 'histogram') {
      const varName = selectedVars[0] || 'avg_ndvi'
      const vals = allData.map(d => d[varName]).filter(v => v !== null && v !== undefined)
      if (vals.length === 0) return { data: [], keys: [] }
      const min = Math.min(...vals)
      const max = Math.max(...vals)
      const binCount = 10
      const step = (max - min) / binCount
      const bins = Array(binCount).fill(0)
      vals.forEach(v => {
        let idx = Math.min(Math.floor((v - min) / step), binCount - 1)
        if (idx < 0) idx = 0
        bins[idx]++
      })
      const histData = bins.map((count, i) => ({
        range: `${(min + i*step).toFixed(2)}-${(min + (i+1)*step).toFixed(2)}`,
        count
      }))
      return { data: histData, keys: ['count'] }
    }

    // Scatter and bubble – grouped by constituency
    if (chartType === 'scatter' || chartType === 'bubble') {
      const grouped = allData.reduce((acc, row) => {
        const key = row.constituency || 'Unknown'
        if (!acc[key]) acc[key] = { sumX: 0, sumY: 0, count: 0, region: row.region }
        acc[key].sumX += row[xVar]
        acc[key].sumY += row[yVar]
        acc[key].count++
        return acc
      }, {})
      const scatterData = Object.entries(grouped).map(([name, vals]) => ({
        constituency: name,
        x: vals.sumX / vals.count,
        y: vals.sumY / vals.count,
        region: vals.region,
        count: vals.count
      }))
      return { data: scatterData, keys: [] }
    }

    return { data: [], keys: [] }
  }

  const builderResult = getBuilderData()

  // ---------- Render chart ----------
  const renderBuilderChart = () => {
    const { data, keys } = builderResult
    if (loading || data.length === 0) {
      return <div style={styles.noData}>No data to display</div>
    }
    const height = 280
    const hasManyCategories = data.length > 8

    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="category"
                stroke="#6b7280"
                fontSize={hasManyCategories ? 9 : 11}
                angle={hasManyCategories ? -45 : 0}
                textAnchor={hasManyCategories ? "end" : "middle"}
                height={hasManyCategories ? 60 : 30}
                interval={0}
              />
              <YAxis stroke="#6b7280" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              {keys.map((k, idx) => <Bar key={k} dataKey={k} fill={COLORS[idx % COLORS.length]} />)}
            </BarChart>
          </ResponsiveContainer>
        )
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="category"
                stroke="#6b7280"
                fontSize={hasManyCategories ? 9 : 11}
                angle={hasManyCategories ? -45 : 0}
                textAnchor={hasManyCategories ? "end" : "middle"}
                height={hasManyCategories ? 60 : 30}
                interval={0}
              />
              <YAxis stroke="#6b7280" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              {keys.map((k, idx) => <Line key={k} type="monotone" dataKey={k} stroke={COLORS[idx % COLORS.length]} />)}
            </LineChart>
          </ResponsiveContainer>
        )
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="category"
                stroke="#6b7280"
                fontSize={hasManyCategories ? 9 : 11}
                angle={hasManyCategories ? -45 : 0}
                textAnchor={hasManyCategories ? "end" : "middle"}
                height={hasManyCategories ? 60 : 30}
                interval={0}
              />
              <YAxis stroke="#6b7280" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              {keys.map((k, idx) => <Area key={k} type="monotone" dataKey={k} fill={COLORS[idx % COLORS.length]} stroke={COLORS[idx % COLORS.length]} />)}
            </AreaChart>
          </ResponsiveContainer>
        )
      case 'radar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <RadarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <PolarGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="category" stroke="#6b7280" fontSize={10} />
              <PolarRadiusAxis stroke="#6b7280" fontSize={10} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              {keys.map((k, idx) => <Radar key={k} name={k} dataKey={k} stroke={COLORS[idx % COLORS.length]} fill={COLORS[idx % COLORS.length]} fillOpacity={0.3} />)}
            </RadarChart>
          </ResponsiveContainer>
        )
      case 'pie':
      case 'donut':
        if (keys.length === 0) return <div style={styles.noData}>No data</div>
        const pieData = data.map(d => ({ name: d.category, value: d.value || 0 }))
        const isDonut = chartType === 'donut'
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={isDonut ? 40 : 0}
                outerRadius={80}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        )
      case 'histogram':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="range" stroke="#6b7280" fontSize={10} angle={-30} textAnchor="end" height={60} />
              <YAxis stroke="#6b7280" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', fontSize: '12px' }} />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        )
      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <ScatterChart margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" dataKey="x" name={xVar.toUpperCase()} stroke="#6b7280" fontSize={11} />
              <YAxis type="number" dataKey="y" name={yVar.toUpperCase()} stroke="#6b7280" fontSize={11} />
              <ZAxis type="number" dataKey="count" range={[50, 400]} name="Fields" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              {colorBy === 'region' ? (() => {
                const groups = {}
                data.forEach(d => {
                  const key = d.region || 'Unknown'
                  if (!groups[key]) groups[key] = []
                  groups[key].push(d)
                })
                return Object.keys(groups).map((name, idx) => (
                  <Scatter key={name} name={name} data={groups[name]} fill={COLORS[idx % COLORS.length]} shape="circle" />
                ))
              })() : (() => {
                return data.map((d, idx) => (
                  <Scatter key={d.constituency} name={d.constituency} data={[d]} fill={COLORS[idx % COLORS.length]} shape="circle" />
                ))
              })()}
            </ScatterChart>
          </ResponsiveContainer>
        )
      case 'bubble':
        const bubbleData = builderResult.data
        return (
          <ResponsiveContainer width="100%" height={height}>
            <ScatterChart margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" dataKey="x" name={xVar.toUpperCase()} stroke="#6b7280" fontSize={11} />
              <YAxis type="number" dataKey="y" name={yVar.toUpperCase()} stroke="#6b7280" fontSize={11} />
              <ZAxis type="number" dataKey="count" range={[80, 400]} name="Fields" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              {colorBy === 'region' ? (() => {
                const groups = {}
                bubbleData.forEach(d => {
                  const key = d.region || 'Unknown'
                  if (!groups[key]) groups[key] = []
                  groups[key].push(d)
                })
                return Object.keys(groups).map((name, idx) => (
                  <Scatter key={name} name={name} data={groups[name]} fill={COLORS[idx % COLORS.length]} shape="circle" />
                ))
              })() : (() => {
                return bubbleData.map((d, idx) => (
                  <Scatter key={d.constituency} name={d.constituency} data={[d]} fill={COLORS[idx % COLORS.length]} shape="circle" />
                ))
              })()}
            </ScatterChart>
          </ResponsiveContainer>
        )
      default:
        return <div style={styles.noData}>Chart type not yet implemented</div>
    }
  }

  // ---------- Evaluation functions ----------
  const runEvaluation = () => {
    if (allData.length === 0 || selectedVars.length === 0) return

    const catKey = category || 'constituency'
    const data = allData

    // Group by category
    const groups = {}
    data.forEach(row => {
      const cat = row[catKey] || 'Unknown'
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(row)
    })
    const groupNames = Object.keys(groups)
    const nGroups = groupNames.length

    // Results object
    const results = {
      groupStats: {},
      anova: {},
      ttest: {},
      correlation: {}
    }

    selectedVars.forEach(varName => {
      const groupData = {}
      groupNames.forEach(g => {
        const vals = groups[g].map(row => row[varName]).filter(v => v !== null && v !== undefined)
        if (vals.length === 0) {
          groupData[g] = { mean: 0, std: 0, count: 0, vals: [] }
          return
        }
        const count = vals.length
        const sum = vals.reduce((a,b) => a+b, 0)
        const mean = sum / count
        const variance = vals.reduce((a,b) => a + (b-mean)**2, 0) / count
        const std = Math.sqrt(variance)
        groupData[g] = { mean, std, count, vals }
      })
      results.groupStats[varName] = groupData

      // ANOVA
      const allVals = Object.values(groupData).flatMap(d => d.vals || [])
      if (allVals.length < 2) {
        results.anova[varName] = { F: null, p: null }
        return
      }
      const totalMean = allVals.reduce((a,b) => a+b, 0) / allVals.length
      const betweenSum = Object.values(groupData).reduce((s, d) => {
        if (d.count === 0) return s
        return s + d.count * (d.mean - totalMean) ** 2
      }, 0)
      const withinSum = Object.values(groupData).reduce((s, d) => {
        if (d.count < 2) return s
        return s + d.vals.reduce((ss, v) => ss + (v - d.mean)**2, 0)
      }, 0)
      const dfBetween = nGroups - 1
      const dfWithin = allVals.length - nGroups
      const MSbetween = betweenSum / dfBetween
      const MSwithin = withinSum / dfWithin
      const F = MSwithin > 0 ? MSbetween / MSwithin : 0
      const p = jStat.ftest(F, dfBetween, dfWithin)
      results.anova[varName] = { F, p }

      // t-test if exactly 2 groups
      if (nGroups === 2) {
        const g1 = groupData[groupNames[0]]
        const g2 = groupData[groupNames[1]]
        if (g1.count > 1 && g2.count > 1) {
          const diff = g1.mean - g2.mean
          const se = Math.sqrt((g1.std**2 / g1.count) + (g2.std**2 / g2.count))
          const t = se > 0 ? diff / se : 0
          const df = ((g1.std**2/g1.count + g2.std**2/g2.count)**2) / (
            ((g1.std**2/g1.count)**2 / (g1.count-1)) +
            ((g2.std**2/g2.count)**2 / (g2.count-1))
          )
          const pVal = jStat.ttest(t, df)
          results.ttest[varName] = { t, p: pVal, group1: groupNames[0], group2: groupNames[1] }
        }
      }
    })

    // Correlation between all pairs of selected variables
    const varNames = selectedVars
    for (let i = 0; i < varNames.length; i++) {
      for (let j = i+1; j < varNames.length; j++) {
        const v1 = varNames[i], v2 = varNames[j]
        const pairs = allData
          .filter(row => row[v1] !== null && row[v1] !== undefined && row[v2] !== null && row[v2] !== undefined)
          .map(row => ({ x: row[v1], y: row[v2] }))
        if (pairs.length < 3) {
          results.correlation[`${v1}-${v2}`] = { r: null, p: null, var1: v1, var2: v2 }
          continue
        }
        const n = pairs.length
        const sumX = pairs.reduce((a,p) => a+p.x, 0)
        const sumY = pairs.reduce((a,p) => a+p.y, 0)
        const sumXY = pairs.reduce((a,p) => a+p.x*p.y, 0)
        const sumX2 = pairs.reduce((a,p) => a+p.x*p.x, 0)
        const sumY2 = pairs.reduce((a,p) => a+p.y*p.y, 0)
        const r = (n*sumXY - sumX*sumY) / Math.sqrt((n*sumX2 - sumX*sumX) * (n*sumY2 - sumY*sumY))
        const rVal = isNaN(r) ? 0 : r
        const t = rVal * Math.sqrt((n-2) / (1 - rVal*rVal))
        const pVal = jStat.ttest(t, n-2)
        results.correlation[`${v1}-${v2}`] = { r: rVal, p: pVal, var1: v1, var2: v2 }
      }
    }

    setEvalResults(results)
    setShowEvaluation(true)
  }

  // ---------- Export results ----------
  const exportResults = () => {
    if (!evalResults) return
    const rows = []
    selectedVars.forEach(varName => {
      const groupData = evalResults.groupStats[varName]
      Object.entries(groupData).forEach(([group, stats]) => {
        rows.push({
          Variable: varName,
          Statistic: 'Count',
          Group: group,
          Value: stats.count
        })
        rows.push({
          Variable: varName,
          Statistic: 'Mean',
          Group: group,
          Value: stats.mean
        })
        rows.push({
          Variable: varName,
          Statistic: 'StdDev',
          Group: group,
          Value: stats.std
        })
      })
      // ANOVA
      if (evalResults.anova[varName]) {
        rows.push({
          Variable: varName,
          Statistic: 'ANOVA_F',
          Group: '',
          Value: evalResults.anova[varName].F
        })
        rows.push({
          Variable: varName,
          Statistic: 'ANOVA_p',
          Group: '',
          Value: evalResults.anova[varName].p
        })
      }
      // t-test
      if (evalResults.ttest[varName]) {
        rows.push({
          Variable: varName,
          Statistic: 'ttest_t',
          Group: '',
          Value: evalResults.ttest[varName].t
        })
        rows.push({
          Variable: varName,
          Statistic: 'ttest_p',
          Group: '',
          Value: evalResults.ttest[varName].p
        })
        rows.push({
          Variable: varName,
          Statistic: 'ttest_group1',
          Group: '',
          Value: evalResults.ttest[varName].group1
        })
        rows.push({
          Variable: varName,
          Statistic: 'ttest_group2',
          Group: '',
          Value: evalResults.ttest[varName].group2
        })
      }
    })
    Object.values(evalResults.correlation).forEach(entry => {
      rows.push({
        Variable: `${entry.var1} vs ${entry.var2}`,
        Statistic: 'Correlation_r',
        Group: '',
        Value: entry.r
      })
      rows.push({
        Variable: `${entry.var1} vs ${entry.var2}`,
        Statistic: 'Correlation_p',
        Group: '',
        Value: entry.p
      })
    })

    let content = ''
    let filename = 'evaluation_results'
    if (exportFormat === 'csv') {
      const headers = Object.keys(rows[0])
      const csvRows = [headers.join(','), ...rows.map(row => headers.map(h => JSON.stringify(row[h] ?? '')).join(','))]
      content = csvRows.join('\n')
      filename += '.csv'
    } else if (exportFormat === 'tsv') {
      const headers = Object.keys(rows[0])
      const tsvRows = [headers.join('\t'), ...rows.map(row => headers.map(h => String(row[h] ?? '')).join('\t'))]
      content = tsvRows.join('\n')
      filename += '.tsv'
    } else if (exportFormat === 'json') {
      content = JSON.stringify(evalResults, null, 2)
      filename += '.json'
    }

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  // ---------- Navigation ----------
  const handleBuilderTest = () => {
    navigate('/confirmatory', {
      state: {
        testType: 'anova',
        groupVar: category,
        numericVars: selectedVars,
        from: 'exploratory'
      }
    })
  }

  // ---------- Render ----------
  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>🔬 Exploratory Analytics</h1>
      </div>

      <div style={styles.contentContainer}>
        <div style={styles.leftCol}>
          {/* Correlation Matrix */}
          <div style={styles.card}>
            <div style={styles.chartTitle}>📊 Correlation Matrix</div>
            {loading ? (
              <div style={styles.noData}>Loading...</div>
            ) : allData.length === 0 ? (
              <div style={styles.noData}>No data for this season. Try another.</div>
            ) : (
              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}> </th>
                      {vars.map(v => <th key={v} style={styles.th}>{v.toUpperCase()}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {vars.map((rowVar, i) => (
                      <tr key={rowVar}>
                        <td style={{ ...styles.td, fontWeight: 600 }}>{rowVar.toUpperCase()}</td>
                        {vars.map((colVar, j) => {
                          const val = matrix[i]?.[j] || 0
                          const abs = Math.abs(val)
                          const bg = abs > 0.7 ? '#dcfce7' : abs > 0.4 ? '#fef9c3' : '#f3f4f6'
                          return (
                            <td key={colVar} style={{ ...styles.td, textAlign: 'center', backgroundColor: bg }}>
                              {val.toFixed(2)}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Multi‑Variable Chart Builder */}
          <div style={styles.card}>
            <div style={styles.chartTitle}>📈 Multi‑Variable Chart Builder</div>
            <div style={styles.builderControls}>
              <div style={styles.controlGroup}>
                <span style={styles.controlLabel}>Chart Type:</span>
                <select value={chartType} onChange={e => setChartType(e.target.value)} style={styles.builderSelect}>
                  {chartTypes.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                </select>
              </div>
              <div style={styles.controlGroup}>
                <span style={styles.controlLabel}>Variables:</span>
                <div style={styles.multiSelectContainer}>
                  <button
                    style={styles.multiSelectButton}
                    onClick={() => setShowVarDropdown(!showVarDropdown)}
                  >
                    {selectedVars.length ? selectedVars.map(v => v.toUpperCase()).join(', ') : 'Select...'}
                  </button>
                  {showVarDropdown && (
                    <div style={styles.multiSelectDropdown}>
                      {numericVars.map(v => (
                        <label key={v} style={styles.checkboxItem}>
                          <input
                            type="checkbox"
                            checked={selectedVars.includes(v)}
                            onChange={() => {
                              setSelectedVars(prev =>
                                prev.includes(v) ? prev.filter(item => item !== v) : [...prev, v]
                              )
                            }}
                          />
                          <span style={styles.checkboxLabel}>{v.toUpperCase()}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div style={styles.controlGroup}>
                <span style={styles.controlLabel}>Category:</span>
                <select value={category} onChange={e => setCategory(e.target.value)} style={styles.builderSelect}>
                  {categoricalVars.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                </select>
              </div>
              {(chartType === 'scatter' || chartType === 'bubble') && (
                <>
                  <div style={styles.controlGroup}>
                    <span style={styles.controlLabel}>X:</span>
                    <select value={xVar} onChange={e => setXVar(e.target.value)} style={styles.controlSelect}>
                      {numericVars.map(v => <option key={v} value={v}>{v.toUpperCase()}</option>)}
                    </select>
                  </div>
                  <div style={styles.controlGroup}>
                    <span style={styles.controlLabel}>Y:</span>
                    <select value={yVar} onChange={e => setYVar(e.target.value)} style={styles.controlSelect}>
                      {numericVars.map(v => <option key={v} value={v}>{v.toUpperCase()}</option>)}
                    </select>
                  </div>
                  <div style={styles.controlGroup}>
                    <span style={styles.controlLabel}>Color by:</span>
                    <select value={colorBy} onChange={e => setColorBy(e.target.value)} style={styles.controlSelect}>
                      {colorOptions.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                    </select>
                  </div>
                </>
              )}
            </div>
            <div style={{ height: '280px' }}>
              {loading ? (
                <div style={styles.noData}>Loading...</div>
              ) : (
                renderBuilderChart()
              )}
            </div>
            <button onClick={runEvaluation} style={styles.testBtn}>Evaluate</button>
          </div>
        </div>

        <div style={styles.rightCol}>
          <div style={styles.card}>
            <div style={styles.chartTitle}>📋 Summary Statistics</div>
            {loading ? (
              <div style={styles.noData}>Loading...</div>
            ) : allData.length === 0 ? (
              <div style={styles.noData}>No data</div>
            ) : (
              <div>
                {numericVars.map(key => (
                  <div key={key} style={styles.statRow}>
                    <span style={styles.statLabel}>{key.toUpperCase()}</span>
                    <span style={styles.statValue}>
                      {stats[key]?.mean.toFixed(3)} ± {stats[key]?.std.toFixed(3)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={styles.card}>
            <div style={styles.chartTitle}>🏆 Constituencies Ranking</div>
            <div style={styles.topControls}>
              <span style={styles.controlLabel}>Metric:</span>
              <select
                value={topMetric}
                onChange={e => setTopMetric(e.target.value)}
                style={styles.controlSelect}
              >
                {numericVars.map(v => <option key={v} value={v}>{v.toUpperCase()}</option>)}
              </select>
            </div>
            <div style={{ height: '200px', flex: 1, minHeight: 0 }}>
              {loading ? (
                <div style={styles.noData}>Loading...</div>
              ) : allData.length === 0 ? (
                <div style={styles.noData}>No data</div>
              ) : topData.length === 0 ? (
                <div style={styles.noData}>No data</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topData} layout="vertical" margin={{ left: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis type="number" stroke="#6b7280" fontSize={10} />
                    <YAxis dataKey="constituency" type="category" stroke="#6b7280" width={80} tick={{ fontSize: 9 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', fontSize: '12px' }} />
                    <Bar dataKey="value" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Evaluation Modal */}
      {showEvaluation && evalResults && (
        <div style={styles.modalOverlay} onClick={() => setShowEvaluation(false)}>
          <div style={styles.modalCard} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.modalTitle}>📊 Evaluation Results</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <select
                  value={exportFormat}
                  onChange={e => setExportFormat(e.target.value)}
                  style={styles.controlSelect}
                >
                  <option value="csv">CSV</option>
                  <option value="tsv">TSV</option>
                  <option value="json">JSON</option>
                </select>
                <button onClick={exportResults} style={styles.exportBtn}>Export</button>
                <button style={styles.closeBtn} onClick={() => setShowEvaluation(false)}>×</button>
              </div>
            </div>

            {selectedVars.map(varName => {
              const groupData = evalResults.groupStats[varName]
              if (!groupData) return null
              const groupNames = Object.keys(groupData)
              return (
                <div key={varName}>
                  <div style={styles.sectionTitle}>{varName.toUpperCase()} – Group Summary</div>
                  <table style={styles.resultTable}>
                    <thead>
                      <tr>
                        <th style={styles.resultTh}>Group</th>
                        <th style={styles.resultTh}>Count</th>
                        <th style={styles.resultTh}>Mean</th>
                        <th style={styles.resultTh}>Std Dev</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupNames.map(g => (
                        <tr key={g}>
                          <td style={styles.resultTd}>{g}</td>
                          <td style={styles.resultTd}>{groupData[g].count}</td>
                          <td style={styles.resultTd}>{groupData[g].mean.toFixed(3)}</td>
                          <td style={styles.resultTd}>{groupData[g].std.toFixed(3)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {evalResults.anova[varName] && (
                    <div style={{ fontSize: '0.8rem', marginBottom: '12px' }}>
                      <strong>ANOVA:</strong> F = {evalResults.anova[varName].F?.toFixed(3) || 'N/A'}, p = {evalResults.anova[varName].p?.toFixed(4) || 'N/A'}
                      {evalResults.ttest[varName] && (
                        <span style={{ marginLeft: '16px' }}>
                          <strong>t-test:</strong> t = {evalResults.ttest[varName].t?.toFixed(3)}, p = {evalResults.ttest[varName].p?.toFixed(4)}
                          (groups: {evalResults.ttest[varName].group1} vs {evalResults.ttest[varName].group2})
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )
            })}

            <div style={styles.sectionTitle}>Correlation Matrix (among selected variables)</div>
            <table style={styles.resultTable}>
              <thead>
                <tr>
                  <th style={styles.resultTh}>Variable 1</th>
                  <th style={styles.resultTh}>Variable 2</th>
                  <th style={styles.resultTh}>Pearson r</th>
                  <th style={styles.resultTh}>p-value</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(evalResults.correlation).map((entry, idx) => (
                  <tr key={idx}>
                    <td style={styles.resultTd}>{entry.var1.toUpperCase()}</td>
                    <td style={styles.resultTd}>{entry.var2.toUpperCase()}</td>
                    <td style={styles.resultTd}>{entry.r?.toFixed(3) || 'N/A'}</td>
                    <td style={styles.resultTd}>{entry.p?.toFixed(4) || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '8px' }}>
              * p-values are two-tailed. Null hypothesis: correlation = 0.
            </div>
          </div>
        </div>
      )}

      <div style={styles.footer}>Exploratory Analytics Dashboard</div>
    </div>
  )
}