🚀 High-Performance Healthcare Data Engine (CSV to SQL)

📌 Project Overview
This project is a high-throughput ETL (Extract, Transform, Load) pipeline built to ingest large-scale synthetic patient datasets. Unlike standard row-by-row importers, this engine is optimized for scalability and memory efficiency, utilizing Node.js streams to handle massive files without system overhead.

🛠️ Technology Stack
•Language: JavaScript (Node.js) 💻

•Database: PostgreSQL (pgAdmin 4) 🐘

•Libraries: pg (Postgres client), csv-parser (Streaming parser), pg-format (Bulk insert formatting)

•Concepts: Stream Processing, Bulk Batch Loading, Data Sanitization, Referential Integrity.

🚀 Pipeline Architecture & Optimizations

1. Extract (Memory-Safe Streaming) 🌊
•Utilized fs.createReadStream to process files in chunks, ensuring the system can process millions of rows without exceeding RAM limits.

•Implemented a header-mapping function to sanitize CSV headers (lowercase, trimming, and underscore replacement) for seamless database compatibility.

2. Transform (Sequential Loading & Logic) 🏗️
•Engineered a Sequential Manifest to manage table dependencies. The engine ensures "Parent" records (e.g., patients.csv) are fully loaded before "Child" records (e.g., allergies.csv) to maintain database integrity.

•Applied transformation logic to handle data types, such as converting empty strings to SQL NULL and formatting healthcare expense metrics.

3. Load (High-Speed Bulk Ingestion) 📦
•Implemented Batching Logic (500 rows per batch) to minimize database round-trips.

•Leveraged pg-format for optimized multi-row INSERT statements, resulting in a significantly faster ingestion rate compared to standard insertion methods.