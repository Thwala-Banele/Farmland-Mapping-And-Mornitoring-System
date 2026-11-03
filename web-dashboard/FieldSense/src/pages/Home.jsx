import { useState } from "react";

function Home() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="home-container dark-theme">
      {/* Hero Section */}
      <div className="hero-section">
        <img src="/coverfire.png" alt="Sentinel‑2 Imagery" className="hero-image" />
        <div className="hero-overlay">
          <h1>FieldSense Crop Monitor</h1>
          <p>
            Open, timely, and science‑driven insights on crop conditions using
            Sentinel‑2 imagery and climate data to support agricultural transparency.
          </p>
        </div>
      </div>

      {/* Cards Section */}
      <div className="cards-container">
        <div className="card dark-card">
          <div className="card-icon">🛰️</div>
          <h3>Data Sources</h3>
          <p>
            We integrate <strong>Sentinel‑2 satellite imagery</strong> (10–20 m resolution)
            for vegetation indices and field boundary delineation, combined with
            <strong> CHIRPS & ERA5</strong> rainfall and temperature data.
          </p>
        </div>

        <div className="card dark-card">
          <div className="card-icon">🌿</div>
          <h3>Key Vegetation Index</h3>
          <p>
            <strong className="highlight-green">NDVI</strong> = (NIR − Red) / (NIR + Red) – a
            standard measure of vegetation health and density.
          </p>
          <button className="more-btn" onClick={() => setShowModal(true)}>
            More indices →
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Vegetation Indices – How They Are Calculated</h2>
            <div className="index-box green">
              <strong>NDVI (Normalized Difference Vegetation Index)</strong>
              <p>(NIR − Red) / (NIR + Red) → vegetation health and density.</p>
            </div>
            <div className="index-box blue">
              <strong>EVI (Enhanced Vegetation Index)</strong>
              <p>
                2.5 × (NIR − Red) / (NIR + 6 × Red − 7.5 × Blue + 1) → improved for dense canopies and atmospheric correction.
              </p>
            </div>
            <div className="index-box teal">
              <strong>NDWI (Normalized Difference Water Index)</strong>
              <p>(Green − NIR) / (Green + NIR) → plant water content and canopy moisture stress.</p>
            </div>
            <div className="index-box red">
              <strong>GNDVI (Green Normalized Difference Vegetation Index)</strong>
              <p>(NIR − Green) / (NIR + Green) → chlorophyll content, less sensitive to soil background.</p>
            </div>
            <div className="index-box orange">
              <strong>EVI2</strong>
              <p>2.5 × (NIR − Red) / (NIR + 2.4 × Red + 1) → two‑band version of EVI for sensors without blue band.</p>
            </div>
            <div className="index-box purple">
              <strong>LSWI (Land Surface Water Index)</strong>
              <p>(NIR − SWIR) / (NIR + SWIR) → surface moisture and flood detection.</p>
            </div>
            <div className="index-box yellow">
              <strong>BSI (Bare Soil Index)</strong>
              <p>((SWIR + Red) − (NIR + Blue)) / ((SWIR + Red) + (NIR + Blue)) → soil exposure and land degradation.</p>
            </div>
            <button className="close-btn" onClick={() => setShowModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
