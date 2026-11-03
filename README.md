# Farmland Mapping and Monitoring System

An end-to-end geospatial monitoring system that processes multi-temporal satellite imagery, runs deep learning crop classification, and visualizes agricultural spatial data via an interactive web dashboard.

---

##  Repository Architecture

```text
Farmland-Mapping-And-Monitoring-System/
├── model-pipeline/    # GEE satellite data extraction & PyTorch U-Net inference scripts
└── web-dashboard/     # React frontend dashboard with Supabase integration
