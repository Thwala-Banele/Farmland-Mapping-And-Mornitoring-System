# Geospatial U-Net Farmland Mapping & Inference Pipeline

An automated deep learning and GIS pipeline designed to process multi-temporal satellite imagery, handle resolution mismatches, and perform pixel-level crop classification using PyTorch and Rasterio.

## Key Technical Features
* **Resolution Harmonization:** Dynamically upsamples 20m Sentinel-2 bands to a 10m target grid on-the-fly using bilinear interpolation (`rasterio`).
* **Memory-Efficient Sliding Window Inference:** Processes large-scale raster maps block-by-block using 256x256 pixel patches with automated border padding to prevent RAM/GPU overflow.
* **Deep Learning Prediction:** Deploys a custom 4-channel U-Net architecture (`PyTorch`) with sigmoid probability thresholding to generate clean, georeferenced binary classification masks (`.tif`).

## Tech Stack & Libraries
* **Python**
* **PyTorch** (Deep Learning & Inference)
* **Rasterio & NumPy** (Geospatial Raster Handling & Matrix Operations)
* **Google Colab & Google Drive** (Cloud GPU execution environment)

## Pipeline Workflow
1. **Patch Extraction:** Slices multi-temporal raw spectral bands into normalized training/testing patches (`.npy`).
2. **Model Inference:** Loads pre-trained U-Net weights (`.pth`), processes imagery features, and rebuilds predictions across the full map canvas.
3. **Raster Export:** Outputs a finalized, transparent-ready geospatial GeoTIFF map layer.
