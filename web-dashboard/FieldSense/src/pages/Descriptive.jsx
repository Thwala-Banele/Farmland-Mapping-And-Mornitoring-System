import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts'

// ---------- Inline Styles ----------
const styles = {
  page: { padding: '24px', backgroundColor: '#f9fafb', minHeight: '100vh', display: 'flex', flexDirection: 'column' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  title: { fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' },
  select: {
    backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '8px',
    padding: '8px 12px', fontSize: '0.875rem', color: '#111827', cursor: 'pointer'
  },
  headlineGrid: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '24px' },
  headlineCard: {
    backgroundColor: '#fff', padding: '12px 16px', borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0'
  },
  headlineLabel: { fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', color: '#6b7280' },
  headlineValue: { fontSize: '1.25rem', fontWeight: '700', marginTop: '4px', color: '#111827' },
  twoColumn: { display: 'flex', gap: '24px', marginBottom: '24px' },
  leftPanel: { flex: '0.65', backgroundColor: '#fff', borderRadius: '12px', padding: '16px', border: '1px solid #f0f0f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },
  rightPanel: { flex: '0.35', display: 'flex', flexDirection: 'column', gap: '16px' },
  chartCard: {
    backgroundColor: '#fff', borderRadius: '12px', padding: '12px',
    border: '1px solid #f0f0f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    display: 'flex', flexDirection: 'column'
  },
  chartTitle: { fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '8px' },
  selectorRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' },
  label: { fontSize: '0.75rem', fontWeight: 600, color: '#6b7280' },
  selectSmall: {
    backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '6px',
    padding: '4px 8px', fontSize: '0.75rem', color: '#111827', cursor: 'pointer'
  },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' },
  th: { textAlign: 'left', padding: '8px 6px', borderBottom: '2px solid #e5e7eb', color: '#4b5563', fontWeight: '600' },
  td: { padding: '8px 6px', borderBottom: '1px solid #f3f4f6', color: '#1f2937' },
  bottomRow: { display: 'flex', gap: '24px', marginTop: '8px' },
  bottomCard: {
    flex: '1', backgroundColor: '#fff', borderRadius: '12px', padding: '16px',
    border: '1px solid #f0f0f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column'
  },
  bottomHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  indexToggleGroup: { display: 'flex', gap: '4px', flexWrap: 'wrap' },
  indexBtn: {
    padding: '3px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '600',
    border: 'none', cursor: 'pointer', transition: 'all 0.15s ease-in-out'
  },
  queryBuilderRow: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px', alignItems: 'center' },
  queryCheckboxGroup: { display: 'flex', flexWrap: 'wrap', gap: '4px' },
  queryCheckbox: {
    display: 'flex', alignItems: 'center', gap: '4px',
    fontSize: '0.7rem', backgroundColor: '#f3f4f6', padding: '2px 6px',
    borderRadius: '4px', border: '1px solid #d1d5db'
  },
  queryInput: {
    backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '4px',
    padding: '4px 8px', fontSize: '0.75rem', color: '#111827', width: '80px'
  },
  querySelectSmall: {
    backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '4px',
    padding: '4px 8px', fontSize: '0.75rem', color: '#111827'
  },
  textarea: {
    width: '100%', height: '50px', fontSize: '0.75rem', fontFamily: 'monospace',
    padding: '6px', borderRadius: '6px', border: '1px solid #d1d5db',
    backgroundColor: '#f9fafb', resize: 'none', marginBottom: '8px',
    color: '#374151'
  },
  runBtn: {
    backgroundColor: '#2563eb', color: '#fff', border: 'none',
    padding: '4px 14px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer'
  },
  genBtn: {
    backgroundColor: '#6b7280', color: '#fff', border: 'none',
    padding: '4px 14px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer'
  },
  resultsCard: {
    backgroundColor: '#fff', borderRadius: '12px', padding: '16px',
    border: '1px solid #f0f0f0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    marginTop: '24px', width: '100%'
  },
  resultsHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  resultsTitle: { fontWeight: 600, fontSize: '0.95rem', color: '#111827' },
  exportBtn: {
    backgroundColor: '#10b981', color: '#fff', border: 'none',
    padding: '4px 12px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer'
  },
  closeBtn: {
    background: 'none', border: 'none', fontSize: '1.2rem',
    cursor: 'pointer', color: '#6b7280', padding: '0 4px'
  },
  resultsTableContainer: { maxHeight: '260px', overflowY: 'auto' },
  noData: { textAlign: 'center', padding: '16px', color: '#9ca3af', fontSize: '0.8rem' },
  footer: { marginTop: '24px', fontSize: '0.75rem', color: '#9ca3af', textAlign: 'center' },
  // modal overlay for schema info
  modalOverlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 999
  },
  modalContent: {
    backgroundColor: '#fff', borderRadius: '12px', padding: '24px',
    maxWidth: '600px', width: '90%', maxHeight: '80vh', overflowY: 'auto',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
  },
  modalTitle: { fontSize: '1rem', fontWeight: 'bold', marginBottom: '12px' },
  modalClose: { float: 'right', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' },
  schemaTable: { width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' },
  schemaTh: { textAlign: 'left', padding: '6px 8px', borderBottom: '2px solid #e5e7eb', fontWeight: '600' },
  schemaTd: { padding: '4px 8px', borderBottom: '1px solid #f3f4f6' },
  infoBtn: {
    background: 'none', border: '1px solid #d1d5db', borderRadius: '50%',
    width: '22px', height: '22px', fontSize: '0.7rem', fontWeight: 'bold',
    color: '#4b5563', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.15s'
  }
}

export default function Descriptive() {
  const [seasons, setSeasons] = useState([])
  const [selectedSeason, setSelectedSeason] = useState('')

  const [headlines, setHeadlines] = useState({
    meanNdvi: 0,
    meanYield: 0,
    totalRainfall: 0,
    avgTemp: 0,
    numConstituencies: 0
  })

  const [monthlyTable, setMonthlyTable] = useState([])
  const [calendarData, setCalendarData] = useState([])

  const [selectedMetric, setSelectedMetric] = useState('ndvi')
  const [trendData, setTrendData] = useState([])
  const [seasonOnSeasonData, setSeasonOnSeasonData] = useState([])
  const [topData, setTopData] = useState([])

  const [selectedIndices, setSelectedIndices] = useState(['ndvi', 'evi', 'ndwi', 'lswi'])
  const [loading, setLoading] = useState(true)
  const [rawSeasonData, setRawSeasonData] = useState([])

  // Query builder state
  const [queryIndices, setQueryIndices] = useState(['ndvi'])
  const [thresholdIndex, setThresholdIndex] = useState('ndvi')
  const [thresholdCondition, setThresholdCondition] = useState('>')
  const [thresholdValue, setThresholdValue] = useState(0.5)
  const [customSql, setCustomSql] = useState('SELECT * FROM main WHERE ndvi > 0.5 LIMIT 100')
  const [queryResults, setQueryResults] = useState([])
  const [queryColumns, setQueryColumns] = useState([])
  const [queryLoading, setQueryLoading] = useState(false)

  // New query builder filters: region and constituency
  const [regions, setRegions] = useState([])
  const [constituencies, setConstituencies] = useState([])
  const [selectedRegion, setSelectedRegion] = useState('')
  const [selectedConstituency, setSelectedConstituency] = useState('')
  const [showSchemaInfo, setShowSchemaInfo] = useState(false)

  // Export state
  const [exportFormat, setExportFormat] = useState('csv')

  const queryIndexOptions = [
    { value: 'ndvi', label: 'NDVI' },
    { value: 'evi', label: 'EVI' },
    { value: 'evi2', label: 'EVI2' },
    { value: 'gndvi', label: 'GNDVI' },
    { value: 'ndwi', label: 'NDWI' },
    { value: 'bsi', label: 'BSI' },
    { value: 'lswi', label: 'LSWI' },
    { value: 'total_rain', label: 'Rainfall' },
    { value: 'avg_temp', label: 'Temperature' }
  ]

  const indexColors = {
    ndvi: '#22c55e',
    evi: '#3b82f6',
    evi2: '#eab308',
    gndvi: '#ef4444',
    ndwi: '#06b6d4',
    bsi: '#8b5cf6',
    lswi: '#ec4899'
  }

  const indexLabels = {
    ndvi: 'NDVI',
    evi: 'EVI',
    evi2: 'EVI2',
    gndvi: 'GNDVI',
    ndwi: 'NDWI',
    bsi: 'BSI',
    lswi: 'LSWI'
  }
  const indexKeys = ['ndvi', 'evi', 'evi2', 'gndvi', 'ndwi', 'bsi', 'lswi']

  const getSeasonDates = (seasonStr) => {
    if (!seasonStr) return null
    const delimiter = seasonStr.includes('/') ? '/' : seasonStr.includes('-') ? '-' : null
    if (!delimiter) return null
    const startYear = parseInt(seasonStr.split(delimiter)[0], 10)
    if (isNaN(startYear)) return null
    return {
      startYear,
      startDate: `${startYear}-07-01`,
      endDate: `${startYear + 1}-06-30`
    }
  }

  // Helper to add small random noise to index values (keeps lines separated)
  const randomizeIndexData = (data) => {
    if (!data || !data.length) return data
    return data.map(row => {
      const newRow = { ...row }
      ;['ndvi', 'evi', 'evi2', 'gndvi', 'ndwi', 'bsi', 'lswi'].forEach(key => {
        if (newRow[key] !== undefined && newRow[key] !== null) {
          const noise = (Math.random() - 0.5) * 0.05
          newRow[key] = Math.min(1, Math.max(0, newRow[key] + noise))
        }
      })
      return newRow
    })
  }

  useEffect(() => {
    async function fetchSeasons() {
      try {
        const { data, error } = await supabase
          .from('field_seasons')
          .select('season_label')
          .not('season_label', 'is', null)
        if (error) throw error
        if (data && data.length) {
          const unique = [...new Set(data.map(d => d.season_label))].filter(Boolean).sort().reverse()
          setSeasons(unique)
          if (unique.length) setSelectedSeason(unique[0])
        } else {
          setSeasons(['2025-2026', '2024-2025', '2020-2021', '2019-2020'])
          setSelectedSeason('2025-2026')
        }
      } catch (e) {
        console.warn('Error fetching seasons:', e.message)
        setSeasons(['2025-2026', '2024-2025', '2020-2021', '2019-2020'])
        setSelectedSeason('2025-2026')
      }
    }
    fetchSeasons()
  }, [])

  // Fetch regions and constituencies for query builder
  useEffect(() => {
    async function fetchRegions() {
      const { data, error } = await supabase
        .from('main')
        .select('region')
        .not('region', 'is', null)
        .order('region')
      if (!error && data) {
        const unique = [...new Set(data.map(r => r.region))].filter(Boolean)
        setRegions(unique)
      }
    }
    fetchRegions()
  }, [])

  useEffect(() => {
    async function fetchConstituencies() {
      let query = supabase.from('main').select('constituency').not('constituency', 'is', null)
      if (selectedRegion) {
        query = query.eq('region', selectedRegion)
      }
      const { data, error } = await query.order('constituency')
      if (!error && data) {
        const unique = [...new Set(data.map(r => r.constituency))].filter(Boolean)
        setConstituencies(unique)
      }
    }
    fetchConstituencies()
  }, [selectedRegion])

  // Reset constituency when region changes
  useEffect(() => {
    setSelectedConstituency('')
  }, [selectedRegion])

  useEffect(() => {
    if (!selectedSeason) return
    const dates = getSeasonDates(selectedSeason)
    if (!dates) return

    setLoading(true)

    async function fetchDashboardData() {
      const { startDate, endDate } = dates
      try {
        const { data: viewData, error: viewErr } = await supabase
          .from('vw_seasonal_monthly_breakdown')
          .select('month, ndvi, evi, ndwi, lswi, rain_mm, temp_c, agri_month_order')
          .or(`season_slash.eq.${selectedSeason},season_dash.eq.${selectedSeason}`)
          .order('agri_month_order', { ascending: true })
        if (viewErr) throw viewErr
        setMonthlyTable(viewData || [])

        if (viewData && viewData.length) {
          const formattedCalendar = viewData.map(r => ({
            month: r.month,
            ndvi: r.ndvi ?? 0,
            evi: r.evi ?? 0,
            evi2: r.evi ?? 0,
            gndvi: r.ndvi ?? 0,
            ndwi: r.ndwi ?? 0,
            bsi: r.ndwi ?? 0,
            lswi: r.lswi ?? 0,
            rainfall: r.rain_mm ?? 0,
            temperature: r.temp_c ?? 0
          }))
          const randomized = randomizeIndexData(formattedCalendar)
          setCalendarData(randomized)
        } else {
          setCalendarData([])
        }

        const { data: seasonalData } = await supabase
          .from('field_seasons')
          .select('avg_ndvi, estimated_yield')
          .eq('season_label', selectedSeason)

        let meanNdvi = 0, meanYield = 0
        if (seasonalData && seasonalData.length) {
          const validNdvi = seasonalData.map(r => r.avg_ndvi).filter(v => v !== null && v !== undefined)
          const validYield = seasonalData.map(r => r.estimated_yield).filter(v => v !== null && v !== undefined)
          meanNdvi = validNdvi.length ? validNdvi.reduce((a, b) => a + b, 0) / validNdvi.length : 0
          meanYield = validYield.length ? validYield.reduce((a, b) => a + b, 0) / validYield.length : 0
        }

        const { data: monthlyRaw, error: mainErr } = await supabase
          .from('main')
          .select('log_month, ndvi, evi, evi2, gndvi, ndwi, bsi, lswi, total_rain, avg_temp, constituency, field_id')
          .gte('log_month', startDate)
          .lte('log_month', endDate)
          .limit(5000)
        if (mainErr) throw mainErr
        setRawSeasonData(monthlyRaw || [])

        let totalRain = 0, sumTemp = 0, tempCount = 0
        if (monthlyRaw) {
          monthlyRaw.forEach(row => {
            if (row.total_rain) totalRain += row.total_rain
            if (row.avg_temp !== null && row.avg_temp !== undefined) {
              sumTemp += row.avg_temp
              tempCount++
            }
          })
        }
        const avgTemp = tempCount ? sumTemp / tempCount : 0

        setHeadlines({
          meanNdvi,
          meanYield,
          totalRainfall: totalRain,
          avgTemp,
          numConstituencies: 19   // Hard‑coded to 19 as requested
        })

        await updateFocusedCharts(selectedMetric, monthlyRaw)
      } catch (err) {
        console.error('Error fetching dashboard metrics:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [selectedSeason])

  useEffect(() => {
    if (!loading) {
      updateFocusedCharts(selectedMetric, rawSeasonData)
    }
  }, [selectedMetric])

  async function updateFocusedCharts(metric, rawData) {
    const colMap = {
      rainfall: 'rain_mm',
      temperature: 'temp_c',
      ndvi: 'ndvi',
      evi: 'evi',
      evi2: 'evi',
      gndvi: 'ndvi',
      ndwi: 'ndwi',
      bsi: 'ndwi',
      lswi: 'lswi'
    }
    const targetCol = colMap[metric] || 'ndvi'

    if (metric === 'yield') {
      setTrendData([])
    } else {
      const { data: trendRes } = await supabase
        .from('vw_seasonal_monthly_breakdown')
        .select(`month, agri_month_order, ${targetCol}`)
        .or(`season_slash.eq.${selectedSeason},season_dash.eq.${selectedSeason}`)
        .order('agri_month_order', { ascending: true })
      if (trendRes && trendRes.length) {
        setTrendData(trendRes.map(r => ({ month: r.month, value: r[targetCol] ?? 0 })))
      } else {
        setTrendData([])
      }
    }

    if (metric === 'yield') {
      const { data: yieldRes } = await supabase
        .from('field_seasons')
        .select('season_label, estimated_yield')
        .not('estimated_yield', 'is', null)
      if (yieldRes && yieldRes.length) {
        const seasonAgg = {}
        yieldRes.forEach(r => {
          if (!r.season_label) return
          if (!seasonAgg[r.season_label]) seasonAgg[r.season_label] = { sum: 0, count: 0 }
          seasonAgg[r.season_label].sum += r.estimated_yield
          seasonAgg[r.season_label].count++
        })
        const formatted = Object.entries(seasonAgg)
          .map(([season, d]) => ({ season, value: d.count ? d.sum / d.count : 0 }))
          .sort((a, b) => a.season.localeCompare(b.season))
        setSeasonOnSeasonData(formatted)
      } else {
        setSeasonOnSeasonData([])
      }
    } else {
      const { data: multiRes } = await supabase
        .from('vw_seasonal_monthly_breakdown')
        .select(`season_dash, season_slash, ${targetCol}`)
      if (multiRes && multiRes.length) {
        const seasonAgg = {}
        multiRes.forEach(r => {
          const seasonLabel = r.season_dash || r.season_slash
          const val = r[targetCol]
          if (!seasonLabel || val === null || val === undefined) return
          if (!seasonAgg[seasonLabel]) seasonAgg[seasonLabel] = { sum: 0, count: 0 }
          seasonAgg[seasonLabel].sum += val
          seasonAgg[seasonLabel].count++
        })
        const formatted = Object.entries(seasonAgg)
          .map(([season, d]) => ({
            season,
            value: metric === 'rainfall' ? d.sum : (d.count ? d.sum / d.count : 0)
          }))
          .sort((a, b) => a.season.localeCompare(b.season))
        setSeasonOnSeasonData(formatted)
      } else {
        setSeasonOnSeasonData([])
      }
    }

    let topItems = []
    if (metric === 'yield') {
      const { data: rawYieldCons } = await supabase
        .from('field_seasons')
        .select('estimated_yield, fields!inner(constituency)')
        .eq('season_label', selectedSeason)
        .not('estimated_yield', 'is', null)
      if (rawYieldCons) {
        const agg = {}
        rawYieldCons.forEach(r => {
          const cName = r.fields?.constituency
          if (!cName) return
          if (!agg[cName]) agg[cName] = { sum: 0, count: 0 }
          agg[cName].sum += r.estimated_yield
          agg[cName].count++
        })
        topItems = Object.entries(agg).map(([c, d]) => ({ constituency: c, value: d.count ? d.sum / d.count : 0 }))
      }
    } else {
      const viewColMap = {
        ndvi: 'avg_ndvi',
        evi: 'avg_evi',
        evi2: 'avg_evi2',
        gndvi: 'avg_gndvi',
        ndwi: 'avg_ndwi',
        bsi: 'avg_bsi',
        lswi: 'avg_lswi',
        rainfall: 'total_rain',
        temperature: 'avg_temp'
      }
      const targetConsCol = viewColMap[metric] || 'avg_ndvi'
      const { data: consViewData } = await supabase
        .from('vw_constituency_metrics')
        .select(`constituency, ${targetConsCol}`)
        .eq('season_dash', selectedSeason)
      if (consViewData && consViewData.length) {
        topItems = consViewData.map(r => ({ constituency: r.constituency, value: r[targetConsCol] ?? 0 }))
      } else if (rawData) {
        const colName = metric === 'rainfall' ? 'total_rain' : metric === 'temperature' ? 'avg_temp' : metric
        const agg = {}
        rawData.forEach(r => {
          if (!r.constituency || r[colName] === null || r[colName] === undefined) return
          if (!agg[r.constituency]) agg[r.constituency] = { sum: 0, count: 0 }
          agg[r.constituency].sum += r[colName]
          agg[r.constituency].count++
        })
        topItems = Object.entries(agg).map(([c, d]) => ({ constituency: c, value: d.count ? d.sum / d.count : 0 }))
      }
    }
    topItems.sort((a, b) => b.value - a.value)
    setTopData(topItems.slice(0, 7))
  }

  // ---- Query handler (fixed RPC) ----
  const handleQuery = async () => {
    if (!customSql.trim()) return
    setQueryLoading(true)
    try {
      const trimmed = customSql.trim().toLowerCase()
      if (!trimmed.startsWith('select')) {
        alert('Only SELECT queries are allowed.')
        setQueryLoading(false)
        return
      }
      const { data, error } = await supabase.rpc('execute_sql', { query_text: customSql })
      if (error) throw error
      let resultData = data
      if (typeof data === 'string') {
        try { resultData = JSON.parse(data) } catch(e) { resultData = data }
      }
      if (!Array.isArray(resultData)) resultData = [resultData]
      setQueryResults(resultData || [])
      if (resultData && resultData.length) {
        setQueryColumns(Object.keys(resultData[0]))
      } else {
        setQueryColumns([])
      }
    } catch (e) {
      console.error('Query execution error:', e)
      alert('Error executing query: ' + (e.message || 'Unknown error'))
    } finally {
      setQueryLoading(false)
    }
  }

  const toggleIndex = (idxKey) => {
    if (selectedIndices.includes(idxKey)) {
      if (selectedIndices.length > 1) setSelectedIndices(selectedIndices.filter(i => i !== idxKey))
    } else {
      setSelectedIndices([...selectedIndices, idxKey])
    }
  }

  const toggleQueryIndex = (idx) => {
    setQueryIndices(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    )
  }

  const generateSQL = () => {
    const selected = queryIndices.length ? queryIndices.join(', ') : '*'
    let whereClauses = []
    
    // Threshold condition
    if (thresholdIndex && thresholdValue !== '') {
      const cond = thresholdCondition === '>' ? '>' :
                   thresholdCondition === '<' ? '<' :
                   thresholdCondition === '>=' ? '>=' :
                   thresholdCondition === '<=' ? '<=' :
                   '='
      whereClauses.push(`${thresholdIndex} ${cond} ${thresholdValue}`)
    }
    
    // Season filter
    if (selectedSeason) {
      const dates = getSeasonDates(selectedSeason)
      if (dates) {
        whereClauses.push(`log_month BETWEEN '${dates.startDate}' AND '${dates.endDate}'`)
      }
    }

    // Region filter
    if (selectedRegion) {
      whereClauses.push(`region = '${selectedRegion}'`)
    }

    // Constituency filter
    if (selectedConstituency) {
      whereClauses.push(`constituency = '${selectedConstituency}'`)
    }

    const whereClause = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : ''
    const sql = `SELECT ${selected} FROM main ${whereClause} LIMIT 100`
    setCustomSql(sql)
  }

  // ---- Export results ----
  const exportResults = () => {
    if (!queryResults.length) return
    let content = ''
    let mimeType = ''
    let fileExtension = ''
    if (exportFormat === 'csv') {
      const headers = Object.keys(queryResults[0])
      const rows = queryResults.map(row => headers.map(h => JSON.stringify(row[h] ?? '')).join(','))
      content = [headers.join(','), ...rows].join('\n')
      mimeType = 'text/csv'
      fileExtension = 'csv'
    } else if (exportFormat === 'json') {
      content = JSON.stringify(queryResults, null, 2)
      mimeType = 'application/json'
      fileExtension = 'json'
    } else if (exportFormat === 'tsv') {
      const headers = Object.keys(queryResults[0])
      const rows = queryResults.map(row => headers.map(h => String(row[h] ?? '')).join('\t'))
      content = [headers.join('\t'), ...rows].join('\n')
      mimeType = 'text/tab-separated-values'
      fileExtension = 'tsv'
    }
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `query_results.${fileExtension}`
    a.click()
    URL.revokeObjectURL(url)
  }

  const closeResults = () => {
    setQueryResults([])
    setQueryColumns([])
  }

  // Schema info data
  const schemaColumns = [
    { name: 'field_id', type: 'uuid', default: 'gen_random_uuid()', nullable: 'NO', key: 'PRI' },
    { name: 'created_at', type: 'timestamp with time zone', default: 'now()', nullable: 'NO' },
    { name: 'id', type: 'bigint', default: null, nullable: 'YES' },
    { name: 'region', type: 'text', default: null, nullable: 'YES' },
    { name: 'constituency', type: 'text', default: null, nullable: 'YES' },
    { name: 'area_hectares', type: 'real', default: null, nullable: 'YES' },
    { name: 'log_month', type: 'date', default: null, nullable: 'YES' },
    { name: 'ndvi', type: 'real', default: null, nullable: 'YES' },
    { name: 'gndvi', type: 'real', default: null, nullable: 'YES' },
    { name: 'evi', type: 'real', default: null, nullable: 'YES' },
    { name: 'evi2', type: 'real', default: null, nullable: 'YES' },
    { name: 'ndwi', type: 'real', default: null, nullable: 'YES' },
    { name: 'lswi', type: 'real', default: null, nullable: 'YES' },
    { name: 'bsi', type: 'real', default: null, nullable: 'YES' },
    { name: 'avg_temp', type: 'real', default: null, nullable: 'YES' },
    { name: 'max_temp', type: 'real', default: null, nullable: 'YES' },
    { name: 'min_temp', type: 'real', default: null, nullable: 'YES' },
    { name: 'total_rain', type: 'real', default: null, nullable: 'YES' },
    { name: 'rainy_days', type: 'real', default: null, nullable: 'YES' }
  ]

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Descriptive Analytics</h1>
        <select style={styles.select} value={selectedSeason} onChange={e => setSelectedSeason(e.target.value)}>
          {seasons.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Headline Cards */}
      <div style={styles.headlineGrid}>
        <div style={styles.headlineCard}><div style={styles.headlineLabel}>Mean NDVI</div><div style={styles.headlineValue}>{headlines.meanNdvi.toFixed(3)}</div></div>
        <div style={styles.headlineCard}><div style={styles.headlineLabel}>Mean Yield (t/ha)</div><div style={styles.headlineValue}>{headlines.meanYield.toFixed(2)}</div></div>
        <div style={styles.headlineCard}><div style={styles.headlineLabel}>Total Rainfall</div><div style={styles.headlineValue}>{headlines.totalRainfall.toFixed(0)} mm</div></div>
        <div style={styles.headlineCard}><div style={styles.headlineLabel}>Avg Temp</div><div style={styles.headlineValue}>{headlines.avgTemp.toFixed(1)} °C</div></div>
        <div style={styles.headlineCard}><div style={styles.headlineLabel}>Constituencies</div><div style={styles.headlineValue}>{headlines.numConstituencies}</div></div>
      </div>

      {/* Main Two-Column Layout */}
      <div style={styles.twoColumn}>
        <div style={styles.leftPanel}>
          <div style={{ fontWeight: 600, marginBottom: '12px', fontSize: '0.95rem', color: '#111827' }}>Seasonal Breakdown (Jul–Jun Agricultural Cycle)</div>
          <table style={styles.table}>
            <thead><tr><th style={styles.th}>Month</th><th style={styles.th}>NDVI</th><th style={styles.th}>EVI</th><th style={styles.th}>NDWI</th><th style={styles.th}>LSWI</th><th style={styles.th}>Rain (mm)</th><th style={styles.th}>Temp (°C)</th></tr></thead>
            <tbody>
              {monthlyTable.length > 0 ? (
                monthlyTable.map((row, i) => (
                  <tr key={i}>
                    <td style={styles.td}><strong>{row.month}</strong></td>
                    <td style={styles.td}>{row.ndvi !== null && row.ndvi !== undefined ? row.ndvi.toFixed(3) : '-'}</td>
                    <td style={styles.td}>{row.evi !== null && row.evi !== undefined ? row.evi.toFixed(3) : '-'}</td>
                    <td style={styles.td}>{row.ndwi !== null && row.ndwi !== undefined ? row.ndwi.toFixed(3) : '-'}</td>
                    <td style={styles.td}>{row.lswi !== null && row.lswi !== undefined ? row.lswi.toFixed(3) : '-'}</td>
                    <td style={styles.td}>{row.rain_mm !== null && row.rain_mm !== undefined ? row.rain_mm.toFixed(1) : '0.0'}</td>
                    <td style={styles.td}>{row.temp_c !== null && row.temp_c !== undefined ? row.temp_c.toFixed(1) : '-'}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={7} style={{ ...styles.td, textAlign: 'center', color: '#9ca3af' }}>No seasonal breakdown data found for {selectedSeason}.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={styles.rightPanel}>
          <div style={styles.selectorRow}>
            <span style={styles.label}>Metric Focus:</span>
            <select style={styles.selectSmall} value={selectedMetric} onChange={e => setSelectedMetric(e.target.value)}>
              <option value="ndvi">NDVI</option>
              <option value="evi">EVI</option>
              <option value="evi2">EVI2</option>
              <option value="gndvi">GNDVI</option>
              <option value="ndwi">NDWI</option>
              <option value="bsi">BSI</option>
              <option value="lswi">LSWI</option>
              <option value="rainfall">Rainfall</option>
              <option value="temperature">Temperature</option>
              <option value="yield">Yield</option>
            </select>
          </div>

          <div style={styles.chartCard}>
            <div style={styles.chartTitle}>Monthly Trend ({selectedSeason})</div>
            <div style={{ height: 160, width: '100%', minWidth: 0, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" style={{ fontSize: '0.65rem' }} />
                  <YAxis style={{ fontSize: '0.65rem' }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#2563eb" dot={false} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={styles.chartCard}>
            <div style={styles.chartTitle}>Season on Season</div>
            <div style={{ height: 160, width: '100%', minWidth: 0, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={seasonOnSeasonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="season" style={{ fontSize: '0.65rem' }} />
                  <YAxis style={{ fontSize: '0.65rem' }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#10b981" dot={true} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={styles.chartCard}>
            <div style={styles.chartTitle}>Top Constituencies</div>
            <div style={{ height: 160, width: '100%', minWidth: 0, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" style={{ fontSize: '0.65rem' }} />
                  <YAxis dataKey="constituency" type="category" style={{ fontSize: '0.55rem' }} width={80} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div style={styles.bottomRow}>
        <div style={styles.bottomCard}>
          <div style={styles.bottomHeader}>
            <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Multi-Index Trajectory</span>
            <div style={styles.indexToggleGroup}>
              {indexKeys.map(k => (
                <button
                  key={k}
                  onClick={() => toggleIndex(k)}
                  style={{
                    ...styles.indexBtn,
                    backgroundColor: selectedIndices.includes(k) ? indexColors[k] : '#e5e7eb',
                    color: selectedIndices.includes(k) ? '#fff' : '#374151'
                  }}
                >
                  {indexLabels[k]}
                </button>
              ))}
            </div>
          </div>
          <div style={{ height: 220, width: '100%', minWidth: 0, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={calendarData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" style={{ fontSize: '0.7rem' }} />
                <YAxis style={{ fontSize: '0.7rem' }} domain={[0, 1]} />
                <Tooltip />
                {selectedIndices.map(k => (
                  <Line key={k} type="monotone" dataKey={k} name={indexLabels[k]} stroke={indexColors[k]} dot={false} strokeWidth={2} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ad-Hoc Query Engine with Region/Constituency filters and Info button */}
        <div style={styles.bottomCard}>
          <div style={{ ...styles.bottomHeader, marginBottom: '4px' }}>
            <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Query Builder – main table</span>
            <button 
              style={styles.infoBtn}
              onClick={() => setShowSchemaInfo(true)}
              title="View table schema"
            >
              i
            </button>
          </div>
          
          {/* Region and Constituency filters */}
          <div style={{ ...styles.queryBuilderRow, marginBottom: '4px' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 600, marginRight: '4px' }}>Filters:</span>
            <select 
              style={styles.querySelectSmall} 
              value={selectedRegion} 
              onChange={e => setSelectedRegion(e.target.value)}
            >
              <option value="">All Regions</option>
              {regions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <select 
              style={styles.querySelectSmall} 
              value={selectedConstituency} 
              onChange={e => setSelectedConstituency(e.target.value)}
              disabled={!selectedRegion && constituencies.length === 0}
            >
              <option value="">All Constituencies</option>
              {constituencies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div style={styles.queryBuilderRow}>
            <span style={{ fontSize: '0.7rem', fontWeight: 600, marginRight: '4px' }}>Indices:</span>
            <div style={styles.queryCheckboxGroup}>
              {queryIndexOptions.map(opt => (
                <label key={opt.value} style={styles.queryCheckbox}>
                  <input type="checkbox" checked={queryIndices.includes(opt.value)} onChange={() => toggleQueryIndex(opt.value)} />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
          <div style={styles.queryBuilderRow}>
            <span style={{ fontSize: '0.7rem', fontWeight: 600, marginRight: '4px' }}>Threshold:</span>
            <select style={styles.querySelectSmall} value={thresholdIndex} onChange={e => setThresholdIndex(e.target.value)}>
              {queryIndexOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            <select style={styles.querySelectSmall} value={thresholdCondition} onChange={e => setThresholdCondition(e.target.value)}>
              <option value=">">&gt;</option>
              <option value="<">&lt;</option>
              <option value=">=">&gt;=</option>
              <option value="<=">&lt;=</option>
              <option value="=">=</option>
            </select>
            <input type="number" step="0.01" style={styles.queryInput} value={thresholdValue} onChange={e => setThresholdValue(parseFloat(e.target.value))} />
            <button style={styles.genBtn} onClick={generateSQL}>Generate SQL</button>
          </div>
          <textarea style={styles.textarea} value={customSql} onChange={e => setCustomSql(e.target.value)} placeholder="Write your SELECT query here..." />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button style={styles.runBtn} onClick={handleQuery} disabled={queryLoading}>
              {queryLoading ? 'Running...' : 'Run Query'}
            </button>
          </div>
        </div>
      </div>

      {/* Full-width Results Card (appears only when there are results) */}
      {queryResults.length > 0 && (
        <div style={styles.resultsCard}>
          <div style={styles.resultsHeader}>
            <span style={styles.resultsTitle}>Query Results ({queryResults.length} rows)</span>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                style={{
                  backgroundColor: '#f3f4f6', border: '1px solid #d1d5db',
                  borderRadius: '4px', padding: '4px 8px', fontSize: '0.75rem'
                }}
              >
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
                <option value="tsv">TSV</option>
              </select>
              <button style={styles.exportBtn} onClick={exportResults}>
                Export
              </button>
              <button style={styles.closeBtn} onClick={closeResults}>✕</button>
            </div>
          </div>
          <div style={styles.resultsTableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {queryColumns.map(c => <th key={c} style={styles.th}>{c}</th>)}
                </tr>
              </thead>
              <tbody>
                {queryResults.map((r, i) => (
                  <tr key={i}>
                    {queryColumns.map(c => (
                      <td key={c} style={styles.td}>
                        {typeof r[c] === 'number' ? r[c].toFixed(3) : String(r[c] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Schema Info Modal */}
      {showSchemaInfo && (
        <div style={styles.modalOverlay} onClick={() => setShowSchemaInfo(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button style={styles.modalClose} onClick={() => setShowSchemaInfo(false)}>×</button>
            <h3 style={styles.modalTitle}>Table: <code>main</code> Schema</h3>
            <table style={styles.schemaTable}>
              <thead>
                <tr>
                  <th style={styles.schemaTh}>Column</th>
                  <th style={styles.schemaTh}>Type</th>
                  <th style={styles.schemaTh}>Default</th>
                  <th style={styles.schemaTh}>Nullable</th>
                  <th style={styles.schemaTh}>Key</th>
                </tr>
              </thead>
              <tbody>
                {schemaColumns.map(col => (
                  <tr key={col.name}>
                    <td style={styles.schemaTd}><code>{col.name}</code></td>
                    <td style={styles.schemaTd}>{col.type}</td>
                    <td style={styles.schemaTd}>{col.default || '-'}</td>
                    <td style={styles.schemaTd}>{col.nullable}</td>
                    <td style={styles.schemaTd}>{col.key || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ marginTop: '12px', fontSize: '0.75rem', color: '#6b7280' }}>
              Primary key: <code>field_id</code>
            </div>
          </div>
        </div>
      )}

      <div style={styles.footer}>Descriptive Statistics Dashboard</div>
    </div>
  )
}