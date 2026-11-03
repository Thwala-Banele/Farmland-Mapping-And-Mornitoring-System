# Farmland Mapping and Monitoring System

An end-to-end geospatial monitoring system designed for a final-year computer science thesis. The application processes multi-temporal Sentinel-2 satellite imagery, performs deep learning crop classification (maize mapping) using PyTorch and Rasterio, and visualizes spatial data via an interactive React web dashboard.

---

##  Table of Contents
1. [Project Overview](#-project-overview)
2. [Architecture & Workflow](#-architecture--workflow)
3. [Tech Stack & Libraries](#-tech-stack--libraries)
4. [Repository Structure](#-repository-structure)
5. [Getting Started & Installation](#-getting-started--installation)
6. [Pipeline Usage](#-pipeline-usage)

---

##  Project Overview

Monitoring agricultural yields and tracking crop health at scale is critical for food security. This project bridges raw satellite observation with modern web development by delivering:
* **Automated Data Retrieval:** Cloud-based spatial data extraction using Google Earth Engine.
* **Deep Learning Inference:** A custom 4-channel U-Net model trained to classify agricultural zones and generate clean binary raster masks.
* **Interactive Frontend:** A web dashboard providing a user interface to explore spatial layers, historical trends, and climate statistics backed by Supabase.

---

##  Architecture & Workflow

The system operates across three core phases:
1. **Data Extraction & Preprocessing (`/model-pipeline`):**
   * Retrieves Sentinel-2 Level-2A surface reflectance data using Google Earth Engine.
   * Handles 20m vs 10m resolution mismatches by applying on-the-fly bilinear interpolation via `Rasterio`.
   * Chunks high-resolution imagery into manageable 256x256 pixel patches with border padding to prevent memory overflows.
2. **AI Inference (`/model-pipeline`):**
   * Loads pre-trained model weights (`.pth`) into a custom U-Net architecture.
   * Runs sliding-window predictions, applies sigmoid probability thresholding, and exports georeferenced GeoTIFF (`.tif`) maps back to cloud storage.
3. **Web Dashboard (`/web-dashboard`):**
   * Consumes spatial outputs and renders them via an intuitive React interface.
   * Manages user data, authentication, and metadata tracking using Supabase.

---

## 🛠️ Tech Stack & Libraries

### **Machine Learning & Geospatial Processing**
* **Python**
* **PyTorch** (Deep learning model structure and inference)
* **Rasterio & NumPy** (Geospatial raster manipulation and matrix math)
* **Google Earth Engine (GEE)** (Cloud remote sensing API)

### **Web Frontend & Backend**
* **React** (Frontend user interface)
* **Supabase** (Database storage and user authentication)
* **Node.js & npm** (Package management and build tools)

---

##  Repository Structure

```text
Farmland-Mapping-And-Monitoring-System/
├── model-pipeline/
│   ├── Prediction_Model.ipynb     # Colab notebook for patch generation and U-Net inference
│   └── gee_extraction.js          # Google Earth Engine multi-temporal data extraction script
└── web-dashboard/                 # React frontend application & Supabase integration
    ├── src/
    ├── public/
    └── package.json
