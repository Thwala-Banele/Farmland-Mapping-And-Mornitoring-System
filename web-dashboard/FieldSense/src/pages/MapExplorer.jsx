import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabaseClient'
import { MapContainer, TileLayer, GeoJSON, LayersControl, ZoomControl } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

// ---------- Inline styles ----------
const styles = {
  page: { 
    padding: '0', 
    backgroundColor: '#f9fafb', 
    height: 'calc(100vh - 70px)', 
    display: 'flex', 
    flexDirection: 'column',
    position: 'relative'
  },
  header: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: '8px 20px',
    backgroundColor: '#fff',
    borderBottom: '1px solid #e5e7eb',
    zIndex: 10,
    flexShrink: 0,
    flexWrap: 'wrap',
    gap: '8px'
  },
  title: { fontSize: '1.1rem', fontWeight: '700', color: '#111827' },
  selectGroup: { display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' },
  select: {
    backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '6px',
    padding: '4px 8px', fontSize: '0.75rem', color: '#111827'
  },
  mapWrapper: { flex: 1, position: 'relative' },
  legend: {
    position: 'absolute', bottom: '30px', right: '20px',
    backgroundColor: '#fff', padding: '12px 16px', borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)', zIndex: 1000,
    border: '1px solid #e5e7eb', minWidth: '140px'
  },
  legendTitle: { fontSize: '0.7rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', marginBottom: '6px' },
  legendItem: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.7rem', padding: '2px 0' },
  legendColor: { width: '16px', height: '16px', borderRadius: '3px', flexShrink: 0 },
  noData: { textAlign: 'center', padding: '40px', color: '#6b7280' },
}

// ---------- Helper functions ----------
const getConditionColor = (value, min, max) => {
  const range = max - min
  if (range === 0) return '#6b7280'
  const pct = (value - min) / range
  if (pct < 0.2) return '#ef4444'      // Poor
  if (pct < 0.4) return '#f59e0b'      // Watch
  if (pct < 0.6) return '#facc15'      // Favourable
  if (pct < 0.8) return '#84cc16'      // Good
  return '#22c55e'                      // Exceptional
}

const getConditionLabel = (value, min, max) => {
  const range = max - min
  if (range === 0) return 'No data'
  const pct = (value - min) / range
  if (pct < 0.2) return 'Poor'
  if (pct < 0.4) return 'Watch'
  if (pct < 0.6) return 'Favourable'
  if (pct < 0.8) return 'Good'
  return 'Exceptional'
}

// ---------- Main Component ----------
export default function MapExplorer() {
  const [seasons, setSeasons] = useState([])
  const [selectedSeason, setSelectedSeason] = useState('')
  const [month, setMonth] = useState('May')
  const [variable, setVariable] = useState('ndvi')
  const [geoJsonData, setGeoJsonData] = useState(null)
  const [maizeGeoJson, setMaizeGeoJson] = useState(null)   // <-- New state
  const [loading, setLoading] = useState(true)
  const mapRef = useRef()

  // ---- Region and Constituency filters ----
  const [regions, setRegions] = useState([])
  const [selectedRegion, setSelectedRegion] = useState('All')
  const [constituencies, setConstituencies] = useState([])
  const [selectedConstituency, setSelectedConstituency] = useState(null)

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const variables = ['ndvi', 'evi', 'evi2', 'gndvi', 'ndwi', 'bsi', 'lswi']

  // ---------- Fetch filter options ----------
  useEffect(() => {
    async function fetchFilters() {
      const fallbackSeasons = ['2024/2025', '2025/2026']

      try {
        const { data: seasonData, error: seasonError } = await supabase
          .from('monthly_metrics')
          .select('log_month')
          .not('log_month', 'is', null)
          .limit(200)

        if (!seasonError && seasonData?.length) {
          const years = [...new Set(seasonData.map(row => new Date(row.log_month).getFullYear()).filter(Boolean))]
          const unique = years
            .map(year => `${year}/${year + 1}`)
            .sort((a, b) => Number(b.split('/')[0]) - Number(a.split('/')[0]))

          if (unique.length) {
            setSeasons(unique)
            setSelectedSeason(unique[0])
          } else {
            setSeasons(fallbackSeasons)
            setSelectedSeason(fallbackSeasons[0])
          }
        } else {
          setSeasons(fallbackSeasons)
          setSelectedSeason(fallbackSeasons[0])
        }
      } catch (err) {
        console.warn('Unable to load seasons, using fallback values:', err)
        setSeasons(fallbackSeasons)
        setSelectedSeason(fallbackSeasons[0])
      }

      try {
        const { data: regionData, error: regionError } = await supabase
          .from('fields')
          .select('region')
          .not('region', 'is', null)

        if (!regionError && regionData) {
          const unique = [...new Set(regionData.map(r => r.region).filter(Boolean))]
          setRegions(['All', ...unique])
        } else {
          setRegions(['All'])
        }
      } catch (err) {
        console.warn('Unable to load regions:', err)
        setRegions(['All'])
      }

      try {
        const { data: constData, error: constError } = await supabase
          .from('fields')
          .select('constituency')
          .not('constituency', 'is', null)

        if (!constError && constData) {
          const unique = [...new Set(constData.map(c => c.constituency).filter(Boolean))]
          setConstituencies(unique)
        } else {
          setConstituencies([])
        }
      } catch (err) {
        console.warn('Unable to load constituencies:', err)
        setConstituencies([])
      }
    }
    fetchFilters()
  }, [])

  // ---------- Fetch static maize GeoJSON ----------
  useEffect(() => {
    fetch('/maize_fields.json')
      .then(res => res.json())
      .then(data => setMaizeGeoJson(data))
      .catch(err => console.error('Failed to load maize fields:', err))
  }, [])

  // ---------- Fetch crop-condition GeoJSON ----------
  useEffect(() => {
    if (!selectedSeason) return
    setLoading(true)

    async function fetchGeoJSON() {
      const yearVal = parseInt(selectedSeason.split('/')[0])
      const startDate = `${yearVal}-01-01`
      const endDate = `${yearVal}-12-31`

      let fieldQuery = supabase
        .from('fields')
        .select('field_id, region, constituency, boundary')
        .not('boundary', 'is', null)
        .limit(2000)

      if (selectedRegion && selectedRegion !== 'All') {
        fieldQuery = fieldQuery.eq('region', selectedRegion)
      }
      if (selectedConstituency) {
        fieldQuery = fieldQuery.eq('constituency', selectedConstituency)
      }

      const { data: fields, error: fieldsError } = await fieldQuery
      if (fieldsError) {
        console.error('Error fetching fields:', fieldsError)
        setLoading(false)
        return
      }

      const fieldIds = fields.map(f => f.field_id)
      if (fieldIds.length === 0) {
        setGeoJsonData({ type: 'FeatureCollection', features: [] })
        setLoading(false)
        return
      }

      const { data: metrics, error: metricsError } = await supabase
        .from('monthly_metrics')
        .select('field_id, log_month, ndvi, evi, evi2, gndvi, ndwi, bsi, lswi')
        .in('field_id', fieldIds)
        .gte('log_month', startDate)
        .lte('log_month', endDate)

      if (metricsError) {
        console.error('Error fetching metrics:', metricsError)
        setLoading(false)
        return
      }

      const metricMap = {}
      const monthIndex = months.indexOf(month)
      metrics.forEach(row => {
        const m = new Date(row.log_month).getMonth()
        if (monthIndex !== -1 && m !== monthIndex) return
        if (!metricMap[row.field_id]) metricMap[row.field_id] = { sum: 0, count: 0 }
        const val = row[variable]
        if (val !== null && val !== undefined) {
          metricMap[row.field_id].sum += val
          metricMap[row.field_id].count++
        }
      })

      const features = fields.map(f => {
        const boundary = f.boundary
        if (!boundary) return null
        const metrics = metricMap[f.field_id]
        const avgVal = metrics ? metrics.sum / metrics.count : null
        return {
          type: 'Feature',
          geometry: boundary,
          properties: {
            field_id: f.field_id,
            region: f.region,
            constituency: f.constituency,
            value: avgVal,
            label: avgVal !== null ? getConditionLabel(avgVal, 0, 1) : 'No data'
          }
        }
      }).filter(f => f !== null)

      setGeoJsonData({
        type: 'FeatureCollection',
        features: features
      })

      setLoading(false)
    }

    fetchGeoJSON()
  }, [selectedSeason, variable, month, selectedRegion, selectedConstituency])

  // ---------- GeoJSON Layers ----------
  const GeoJSONLayer = () => {
    if (!geoJsonData || geoJsonData.features.length === 0) return null

    const onEachFeature = (feature, layer) => {
      const value = feature.properties.value
      const label = feature.properties.label
      if (value !== null) {
        const color = getConditionColor(value, 0, 1)
        layer.setStyle({ color: '#ffffff', weight: 1, fillColor: color, fillOpacity: 0.8 })
        layer.bindPopup(`
          <b>Field ID:</b> ${feature.properties.field_id}<br/>
          <b>${variable.toUpperCase()}:</b> ${value.toFixed(3)}<br/>
          <b>Condition:</b> ${label}
        `)
      } else {
        layer.setStyle({ color: '#ffffff', weight: 1, fillColor: '#d1d5db', fillOpacity: 0.3 })
        layer.bindPopup(`<b>Field ID:</b> ${feature.properties.field_id}<br/><b>No data</b>`)
      }
    }

    return <GeoJSON data={geoJsonData} onEachFeature={onEachFeature} />
  }

  const MaizeLayer = () => {
    if (!maizeGeoJson) return null
    return (
      <GeoJSON
        data={maizeGeoJson}
        style={() => ({
          color: '#1e40af',
          weight: 1,
          fillColor: '#3b82f6',
          fillOpacity: 0.6
        })}
        onEachFeature={(feature, layer) => {
          const area = feature.properties?.area_ha
          layer.bindPopup(`<b>Maize Field</b><br/>Area: ${area ? area.toFixed(2) : 'N/A'} ha`)
        }}
      />
    )
  }

  // ---------- Render ----------
  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.title}>Crop Conditions</div>
        <div style={styles.selectGroup}>
          <select value={selectedSeason} onChange={e => setSelectedSeason(e.target.value)} style={styles.select}>
            {seasons.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={month} onChange={e => setMonth(e.target.value)} style={styles.select}>
            {months.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select value={variable} onChange={e => setVariable(e.target.value)} style={styles.select}>
            {variables.map(v => <option key={v} value={v}>{v.toUpperCase()}</option>)}
          </select>
          <select value={selectedRegion} onChange={e => setSelectedRegion(e.target.value)} style={styles.select}>
            {regions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <select value={selectedConstituency || ''} onChange={e => setSelectedConstituency(e.target.value || null)} style={styles.select}>
            <option value="">All</option>
            {constituencies.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div style={styles.mapWrapper}>
        <MapContainer
          center={[-26.5, 31.5]}
          zoom={8}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ZoomControl position="bottomright" />
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="Crop Conditions">
              <GeoJSONLayer />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Satellite">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              />
            </LayersControl.BaseLayer>
          </LayersControl>
          {/* Maize fields layer always visible */}
          <MaizeLayer />
        </MapContainer>

        {/* Legend */}
        <div style={styles.legend}>
          <div style={styles.legendTitle}>Crop Conditions</div>
          <div style={styles.legendItem}><span style={{ ...styles.legendColor, background: '#22c55e' }}></span> Exceptional</div>
          <div style={styles.legendItem}><span style={{ ...styles.legendColor, background: '#84cc16' }}></span> Good</div>
          <div style={styles.legendItem}><span style={{ ...styles.legendColor, background: '#facc15' }}></span> Favourable</div>
          <div style={styles.legendItem}><span style={{ ...styles.legendColor, background: '#f59e0b' }}></span> Watch</div>
          <div style={styles.legendItem}><span style={{ ...styles.legendColor, background: '#ef4444' }}></span> Poor</div>
          <div style={styles.legendItem}><span style={{ ...styles.legendColor, background: '#d1d5db' }}></span> No data</div>
          <div style={{ marginTop: '8px', borderTop: '1px solid #e5e7eb', paddingTop: '6px' }}>
            <div style={styles.legendItem}><span style={{ ...styles.legendColor, background: '#3b82f6' }}></span> Out of Season</div>
            <div style={styles.legendItem}><span style={{ ...styles.legendColor, background: '#6b7280' }}></span> Fallow</div>
          </div>
        </div>
      </div>
    </div>
  )
}