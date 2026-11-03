import React, { useState } from 'react';

const stepsData = [
  {
    stepNumber: 1,
    title: 'Data Sources & Satellite Imagery Integration',
    category: 'Data Infrastructure',
    description:
      'The system integrates Sentinel-2 optical satellite imagery (10–20 meter spatial resolution) to calculate high-precision vegetation indices and delineate agricultural field boundaries. This data is augmented with CHIRPS precipitation datasets and ERA5 climate reanalysis for granular rainfall and ambient temperature tracking across Eswatini.',
    visualType: 'sources',
    details: [
      'Sentinel-2: Multi-spectral imagery at 10m-20m resolution',
      'CHIRPS & ERA5: High-resolution rainfall and temperature data',
      'Automated field boundary extraction for smallholder farmlands'
    ]
  },
  {
    stepNumber: 2,
    title: 'Vegetation Indices & Mathematical Formulas',
    category: 'Remote Sensing',
    description:
      'Understand the spectral index calculations used across the application to evaluate canopy density, water stress, and crop health across the July-to-June agricultural cycle.',
    visualType: 'formulas',
    details: [
      'NDVI = (NIR - Red) / (NIR + Red) → Canopy Health & Density',
      'EVI = 2.5 × (NIR - Red) / (NIR + 6×Red - 7.5×Blue + 1) → Canopy Canopy Correction',
      'NDWI = (Green - NIR) / (Green + NIR) → Canopy Moisture & Water Stress',
      'GNDVI = (NIR - Green) / (NIR + Green) → Chlorophyll Content',
      'EVI2 = 2.5 × (NIR - Red) / (NIR + 2.4×Red + 1) → Two-band alternative for sensors lacking Blue'
    ]
  },
  {
    stepNumber: 3,
    title: 'Regional & Temporal Filtering',
    category: 'Navigation & Inputs',
    description:
      'Filter national agricultural data by choosing target Season cycles (e.g., 2025–2026), main Regions (Hhohho, Lubombo, Manzini, Shiselweni), or specific administrative Constituencies to focus your analysis.',
    visualType: 'filters',
    details: [
      'Select agricultural cycle running from July to June',
      'Filter geographically across 4 administrative regions',
      'Drill down to granular constituency-level metrics'
    ]
  },
  {
    stepNumber: 4,
    title: 'Descriptive Analytics & Summary Key Metrics',
    category: 'Dashboard Analytics',
    description:
      'View real-time aggregated metrics across your filtered scope, including Mean NDVI canopy density, Enhanced Vegetation Index (EVI), Land Surface Water Index (LSWI), Cumulative Seasonal Rainfall, Mean Temperature, and estimated crop yields.',
    visualType: 'cards',
    details: [
      'Monitor Mean NDVI (Canopy Density) and Water Indices (NDWI/LSWI)',
      'Track cumulative seasonal rainfall (mm) and temperature trends (°C)',
      'Review high-level national indicators and total constituency counts'
    ]
  },
  {
    stepNumber: 5,
    title: 'Single Index Performance & Constituency Ranking',
    category: 'Trend Analysis',
    description:
      'Analyze dynamic temporal curves and historical comparisons for specific remote sensing metrics. Focus on single metrics to evaluate monthly trends throughout the year or compare multi-year historical performances.',
    visualType: 'trends',
    details: [
      'Monthly Trend: Track metric changes from July through June',
      'Season-on-Season: Compare crop performance across past years (2017–2026)',
      'Top Constituencies: Rank regions based on highest health/density scores'
    ]
  },
  {
    stepNumber: 6,
    title: 'Multi-Index Trajectories & SQL Query Builder',
    category: 'Custom Analytics',
    description:
      'Overlay multi-index trajectories on a single timeline to observe relationships between moisture and canopy growth. Use the main table Query Builder to generate and run targeted SQL queries with dynamic numerical threshold filters.',
    visualType: 'queryBuilder',
    details: [
      'Multi-Index Overlay: Interactively toggle NDVI, EVI, NDWI, BSI, and LSWI',
      'Filter Builder: Select indices and set custom thresholds (e.g., ndvi > 0.5)',
      'SQL Generation: Automatically generate and execute standard SQL queries'
    ]
  },
  {
    stepNumber: 7,
    title: 'Multi-Variable Chart Builder',
    category: 'Data Visualization',
    description:
      'Build customized multi-variable bar and line charts to evaluate combinations of metrics (e.g., AVG_NDVI vs. AVG_EVI) grouped by administrative region or constituency.',
    visualType: 'chartBuilder',
    details: [
      'Select chart visual format (Bar, Line, Scatter)',
      'Choose custom variable combinations (AVG_NDVI, AVG_EVI, Rainfall)',
      'Group data dynamically by Constituency or Region and click Evaluate'
    ]
  },
  {
    stepNumber: 8,
    title: 'Seasonal Forecast Cycle & Historical Performance',
    category: 'Predictive Modeling',
    description:
      'Review predictive ML model outputs forecasting upcoming seasonal conditions (NDVI, NDWI, and Rainfall predictions). Evaluate historical performance metrics and confidence ratings calculated over past agricultural cycles.',
    visualType: 'forecast',
    details: [
      'Predicted Trends: Examine projected vegetation and water index trajectories',
      'Historical Accuracy: Verify model accuracy (~90-91%) across 10+ past seasons',
      'Confidence Scoring: Access statistical confidence levels (e.g., 0.75-0.78)'
    ]
  },
  {
    stepNumber: 9,
    title: 'Seasonal Decision Support & Farming Recommendations',
    category: 'Actionable Insights',
    description:
      'Translate satellite analysis into actionable field advisories tailored to the local farming calendar in Eswatini, supporting smallholder maize producers with timely alerts.',
    visualType: 'recommendations',
    details: [
      'Off-Season (June–Sept): Plan land prep, soil testing, and clearing',
      'Moderate Moisture Warning (Oct): Recommend short-season or hybrid maize',
      'Vegetative Development (Nov–Feb): Monitor fertilizer application & pests'
    ]
  }
];

// Helper visual render component
const StepVisual = ({ type }) => {
  switch (type) {
    case 'sources':
      return (
        <svg viewBox="0 0 400 200" style={styles.svg}>
          <rect x="20" y="30" width="100" height="140" rx="8" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2" />
          <text x="70" y="70" textAnchor="middle" fill="#0369a1" fontSize="12" fontWeight="bold">Sentinel-2</text>
          <text x="70" y="90" textAnchor="middle" fill="#0369a1" fontSize="10">10m-20m</text>
          <text x="70" y="110" textAnchor="middle" fill="#0369a1" fontSize="10">Imagery</text>

          <path d="M 130 100 L 170 100" stroke="#64748b" strokeWidth="2" strokeDasharray="4" markerEnd="url(#arrow)" />

          <rect x="180" y="30" width="100" height="140" rx="8" fill="#f0fdf4" stroke="#16a34a" strokeWidth="2" />
          <text x="230" y="70" textAnchor="middle" fill="#15803d" fontSize="12" fontWeight="bold">CHIRPS / ERA5</text>
          <text x="230" y="90" textAnchor="middle" fill="#15803d" fontSize="10">Rainfall &</text>
          <text x="230" y="110" textAnchor="middle" fill="#15803d" fontSize="10">Temperature</text>

          <path d="M 290 100 L 330 100" stroke="#64748b" strokeWidth="2" strokeDasharray="4" />

          <rect x="340" y="30" width="40" height="140" rx="8" fill="#fef3c7" stroke="#d97706" strokeWidth="2" />
          <text x="360" y="105" textAnchor="middle" fill="#b45309" fontSize="10" fontWeight="bold" transform="rotate(-90 360 105)">GIS Engine</text>
        </svg>
      );
    case 'formulas':
      return (
        <div style={styles.codeVisualBox}>
          <div style={styles.codeVisualRow}><span style={styles.badgeNDVI}>NDVI</span> <code>(NIR - Red) / (NIR + Red)</code></div>
          <div style={styles.codeVisualRow}><span style={styles.badgeEVI}>EVI</span> <code>2.5 × (NIR - Red) / (NIR + 6*Red - 7.5*Blue + 1)</code></div>
          <div style={styles.codeVisualRow}><span style={styles.badgeNDWI}>NDWI</span> <code>(Green - NIR) / (Green + NIR)</code></div>
          <div style={styles.codeVisualRow}><span style={styles.badgeGNDVI}>GNDVI</span> <code>(NIR - Green) / (NIR + Green)</code></div>
        </div>
      );
    case 'filters':
      return (
        <div style={styles.filterVisualBox}>
          <div style={styles.dropdownMock}>
            <span style={styles.dropdownLabel}>REGION</span>
            <div style={styles.dropdownSelect}>Lubombo ▾</div>
          </div>
          <div style={styles.dropdownMock}>
            <span style={styles.dropdownLabel}>SEASON</span>
            <div style={styles.dropdownSelect}>2025-2026 ▾</div>
          </div>
          <div style={styles.dropdownMock}>
            <span style={styles.dropdownLabel}>CONSTITUENCY</span>
            <div style={styles.dropdownSelect}>All ▾</div>
          </div>
        </div>
      );
    case 'cards':
      return (
        <div style={styles.cardsGridMock}>
          <div style={styles.miniCard}>
            <span style={styles.miniTitle}>MEAN NDVI</span>
            <span style={styles.miniVal}>0.599</span>
          </div>
          <div style={styles.miniCard}>
            <span style={styles.miniTitle}>EST. YIELD</span>
            <span style={styles.miniVal}>64.69 t/ha</span>
          </div>
          <div style={styles.miniCard}>
            <span style={styles.miniTitle}>TOTAL RAIN</span>
            <span style={styles.miniVal}>596 mm</span>
          </div>
          <div style={styles.miniCard}>
            <span style={styles.miniTitle}>AVG TEMP</span>
            <span style={styles.miniVal}>23.0 °C</span>
          </div>
        </div>
      );
    case 'trends':
      return (
        <svg viewBox="0 0 400 180" style={styles.svg}>
          <polyline
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            points="20,130 60,140 100,120 140,90 180,50 220,55 260,70 300,90 340,50 380,80"
          />
          <circle cx="180" cy="50" r="5" fill="#10b981" />
          <text x="180" y="35" textAnchor="middle" fill="#047857" fontSize="10" fontWeight="bold">Peak Growth (Jan)</text>
          <line x1="20" y1="160" x2="380" y2="160" stroke="#cbd5e1" strokeWidth="1" />
          <text x="20" y="175" fill="#64748b" fontSize="9">Jul</text>
          <text x="180" y="175" fill="#64748b" fontSize="9">Jan</text>
          <text x="380" y="175" fill="#64748b" fontSize="9">Jun</text>
        </svg>
      );
    case 'queryBuilder':
      return (
        <div style={styles.queryMockBox}>
          <div style={styles.checkboxGroup}>
            <span style={styles.chkActive}>☑ NDVI</span>
            <span style={styles.chk}>☐ EVI</span>
            <span style={styles.chk}>☐ NDWI</span>
            <span style={styles.chk}>☐ Rainfall</span>
          </div>
          <div style={styles.sqlPreview}>
            <code>SELECT * FROM main WHERE ndvi &gt; 0.5 LIMIT 100</code>
          </div>
        </div>
      );
    case 'chartBuilder':
      return (
        <svg viewBox="0 0 400 180" style={styles.svg}>
          <rect x="30" y="60" width="18" height="90" fill="#3b82f6" rx="2" />
          <rect x="52" y="40" width="18" height="110" fill="#10b981" rx="2" />
          
          <rect x="110" y="90" width="18" height="60" fill="#3b82f6" rx="2" />
          <rect x="132" y="45" width="18" height="105" fill="#10b981" rx="2" />

          <rect x="190" y="70" width="18" height="80" fill="#3b82f6" rx="2" />
          <rect x="212" y="35" width="18" height="115" fill="#10b981" rx="2" />

          <line x1="20" y1="150" x2="380" y2="150" stroke="#94a3b8" strokeWidth="1" />
          <text x="50" y="168" textAnchor="middle" fill="#64748b" fontSize="9">Hosea</text>
          <text x="130" y="168" textAnchor="middle" fill="#64748b" fontSize="9">Mhlume</text>
          <text x="210" y="168" textAnchor="middle" fill="#64748b" fontSize="9">Nkilongo</text>
        </svg>
      );
    case 'forecast':
      return (
        <div style={styles.tableMockBox}>
          <table style={styles.miniTable}>
            <thead>
              <tr>
                <th>Cycle</th>
                <th>Healthy</th>
                <th>Stressed</th>
                <th>Accuracy</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>2024-2025</td>
                <td>1800 / 1795</td>
                <td>1126 / 1085</td>
                <td>90.27%</td>
              </tr>
              <tr style={{ background: '#ecfdf5' }}>
                <td>2025-2026</td>
                <td>1800 / 1825</td>
                <td>1126 / 1118</td>
                <td><strong>90.64%</strong></td>
              </tr>
              <tr style={{ background: '#f0f9ff' }}>
                <td>2026-2027 (PRED)</td>
                <td>- / 1810</td>
                <td>- / 1100</td>
                <td>90.80% (Est.)</td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    case 'recommendations':
      return (
        <div style={styles.recsBox}>
          <div style={styles.recItem}>
            <span style={styles.recBadgeOff}>June–September</span>
            <span>Plan land preparation, soil testing, and field clearing.</span>
          </div>
          <div style={styles.recItem}>
            <span style={styles.recBadgeWarn}>October</span>
            <span>Plant drought-tolerant, short-season hybrid maize varieties.</span>
          </div>
          <div style={styles.recItem}>
            <span style={styles.recBadgeNormal}>November–February</span>
            <span>Maintain standard fertilization schedules & monitor canopy development.</span>
          </div>
        </div>
      );
    default:
      return null;
  }
};

export default function UserManual() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Data Infrastructure', 'Remote Sensing', 'Navigation & Inputs', 'Dashboard Analytics', 'Trend Analysis', 'Custom Analytics', 'Predictive Modeling', 'Actionable Insights'];

  const filteredSteps = stepsData.filter(step => {
    const matchesSearch = step.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          step.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || step.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={styles.container}>
      {/* Page Header */}
      <header style={styles.header}>
        <div style={styles.headerBadge}>System Documentation</div>
        <h1 style={styles.mainTitle}>Agricultural Monitoring Dashboard Manual</h1>
        <p style={styles.subtitle}>
          Interactive step-by-step guide to satellite imagery interpretation, vegetation index calculations, querying tools, and predictive analytics for Eswatini maize farming.
        </p>

        {/* Filter Bar */}
        <div style={styles.filterBar}>
          <input
            type="text"
            placeholder="Search instructions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
          <div style={styles.categoryChips}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  ...styles.chip,
                  ...(activeCategory === cat ? styles.activeChip : {})
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Manual Steps Grid */}
      <main style={styles.grid}>
        {filteredSteps.map((step) => (
          <div key={step.stepNumber} style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.stepBadge}>Step {step.stepNumber}</span>
              <span style={styles.categoryBadge}>{step.category}</span>
            </div>

            <h2 style={styles.cardTitle}>{step.title}</h2>
            <p style={styles.cardDescription}>{step.description}</p>

            {/* Step Picture / Dynamic Visual Illustration */}
            <div style={styles.visualContainer}>
              <StepVisual type={step.visualType} />
            </div>

            {/* Structured Key Takeaways / Points */}
            <div style={styles.detailsBox}>
              <h4 style={styles.detailsHeading}>Key Operations & Highlights</h4>
              <ul style={styles.detailsList}>
                {step.details.map((detail, idx) => (
                  <li key={idx} style={styles.detailItem}>
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        Agricultural Mapping & Monitoring System • Eswatini Crop Season Guide (July–June Cycle)
      </footer>
    </div>
  );
}

// Inline Styling System
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    color: '#0f172a',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    padding: '32px 24px',
    maxWidth: '1280px',
    margin: '0 auto'
  },
  header: {
    marginBottom: '40px',
    textAlign: 'center'
  },
  headerBadge: {
    display: 'inline-block',
    padding: '6px 16px',
    borderRadius: '20px',
    backgroundColor: '#e0e7ff',
    color: '#4338ca',
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  mainTitle: {
    fontSize: '32px',
    fontWeight: '800',
    color: '#1e293b',
    margin: '0 0 12px 0'
  },
  subtitle: {
    fontSize: '16px',
    color: '#64748b',
    maxWidth: '720px',
    margin: '0 auto 28px auto',
    lineHeight: '1.6'
  },
  filterBar: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px'
  },
  searchInput: {
    width: '100%',
    maxWidth: '480px',
    padding: '12px 18px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
    outline: 'none',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
  },
  categoryChips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    justifyContent: 'center'
  },
  chip: {
    padding: '6px 14px',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
    color: '#475569',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  activeChip: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    borderColor: '#2563eb',
    fontWeight: '600'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
    gap: '24px'
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '14px'
  },
  stepBadge: {
    backgroundColor: '#1e293b',
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: '700',
    padding: '4px 10px',
    borderRadius: '6px'
  },
  categoryBadge: {
    backgroundColor: '#f1f5f9',
    color: '#475569',
    fontSize: '12px',
    fontWeight: '500',
    padding: '4px 10px',
    borderRadius: '6px'
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 10px 0',
    lineHeight: '1.4'
  },
  cardDescription: {
    fontSize: '14px',
    color: '#475569',
    lineHeight: '1.5',
    margin: '0 0 16px 0',
    flexGrow: 1
  },
  visualContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    padding: '16px',
    marginBottom: '18px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '180px'
  },
  svg: {
    width: '100%',
    height: 'auto',
    maxHeight: '170px'
  },
  detailsBox: {
    borderTop: '1px stroke #f1f5f9',
    paddingTop: '12px'
  },
  detailsHeading: {
    fontSize: '12px',
    textTransform: 'uppercase',
    color: '#94a3b8',
    letterSpacing: '0.05em',
    margin: '0 0 8px 0'
  },
  detailsList: {
    margin: 0,
    paddingLeft: '18px',
    fontSize: '13px',
    color: '#334155'
  },
  detailItem: {
    marginBottom: '6px',
    lineHeight: '1.4'
  },
  // Specific Visual Element Styles
  codeVisualBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    width: '100%'
  },
  codeVisualRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '12px'
  },
  badgeNDVI: { backgroundColor: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' },
  badgeEVI: { backgroundColor: '#dbeafe', color: '#1d4ed8', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' },
  badgeNDWI: { backgroundColor: '#cff4fc', color: '#055160', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' },
  badgeGNDVI: { backgroundColor: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' },
  filterVisualBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    width: '100%'
  },
  dropdownMock: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#ffffff',
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '13px'
  },
  dropdownLabel: { fontWeight: '600', color: '#64748b' },
  dropdownSelect: { color: '#0f172a', fontWeight: '500' },
  cardsGridMock: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    width: '100%'
  },
  miniCard: {
    backgroundColor: '#ffffff',
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column'
  },
  miniTitle: { fontSize: '10px', color: '#64748b', fontWeight: '700' },
  miniVal: { fontSize: '16px', fontWeight: '800', color: '#0f172a', marginTop: '4px' },
  queryMockBox: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  checkboxGroup: {
    display: 'flex',
    gap: '10px',
    fontSize: '12px'
  },
  chkActive: { color: '#2563eb', fontWeight: 'bold' },
  chk: { color: '#94a3b8' },
  sqlPreview: {
    backgroundColor: '#1e293b',
    color: '#38bdf8',
    padding: '10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontFamily: 'monospace'
  },
  tableMockBox: {
    width: '100%',
    overflowX: 'auto'
  },
  miniTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '11px',
    textAlign: 'left'
  },
  recsBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    width: '100%',
    fontSize: '12px'
  },
  recItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  recBadgeOff: { color: '#94a3b8', fontWeight: 'bold' },
  recBadgeWarn: { color: '#d97706', fontWeight: 'bold' },
  recBadgeNormal: { color: '#16a34a', fontWeight: 'bold' },
  footer: {
    marginTop: '48px',
    textAlign: 'center',
    fontSize: '13px',
    color: '#94a3b8',
    borderTop: '1px solid #e2e8f0',
    paddingTop: '20px'
  }
};