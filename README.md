# Healthcare EMR Integration Pipeline (C-CDA to SQL)

## 📌 Project Overview

This project simulates a custom healthcare Interface Engine. It demonstrates an end-to-end data integration workflow that extracts clinical data from complex HL7 C-CDA (Consolidated Clinical Document Architecture) XML files, transforms the data for relational integrity, and loads it into a PostgreSQL database for advanced healthcare analytics.

**Data Source:** 100 Sample Synthetic Patient Records (C-CDA format).

## 🛠️ Technology Stack

* **Language:** JavaScript (Node.js)
* **Database:** PostgreSQL (pgAdmin 4)
* **Libraries:** `pg` (PostgreSQL client), `xmldom` (XML parsing), `xpath` (Node navigation)
* **Concepts:** ETL, Advanced SQL (Windowing, CTEs, Aggregations), Object-Oriented Scripting, HL7/C-CDA Standards.

## 🚀 Key Features & Pipeline Architecture

### 1. Extract (XML/XPath Parsing)

* Engineered a Node.js script to traverse deeply nested C-CDA XML trees.
* Utilized `xpath` with proper HL7 namespaces (`urn:hl7-org:v3`) to accurately target specific patient demographics and clinical observation nodes.
* Extracted critical identifiers (Patient IDs), demographics (Names, DOB), and vital signs/lab results from the `` and `` sections.

### 2. Transform (Data Validation & Formatting)

* Built transformation logic to convert raw HL7 timestamps (e.g., `20180416212254`) into standardized, ISO-compliant SQL `TIMESTAMP` formats.
* Implemented conditional validation to ensure only records with complete data (Observation Name, Value, and Time) are processed, preventing database insertion errors and ensuring clean data flow.

### 3. Load (Relational Database Design)

* Designed a relational SQL schema to handle the "One-to-Many" relationship between a single patient and their multiple historical medical observations.
* Utilized `ON CONFLICT DO NOTHING` constraints to prevent duplicate record ingestion during automated batch runs.

## 🗄️ Database Schema

The data is structured into two primary tables:

* **`patients`:** Stores unique patient identifiers, first name, and last name.
* **`observations`:** Stores individual clinical data points (e.g., Blood Pressure, BMI) linked to the patient via a foreign key (`patient_external_id`), along with the recorded value, unit, and exact timestamp.

## 📊 Advanced Analytics & SQL

This pipeline supports complex healthcare queries to drive analytics and decision-making.

**Example 1: Identifying the Most Recent Clinical Readings (Window Functions)**
Used Common Table Expressions (CTEs) and `ROW_NUMBER() OVER (PARTITION BY ...)` to filter out historical noise and return only the latest critical vitals (e.g., Systolic Blood Pressure) for each patient.

**Example 2: Patient Health Aggregations**
Utilized `JOIN` and `GROUP BY` aggregations to calculate average patient metrics (e.g., Average BMI) by casting stored text values into numeric formats for mathematical analysis.

## 💡 Business Value

By automating the extraction and standardization of raw EMR exports, this pipeline ensures that downstream analytics platforms receive clean, structured, and deduplicated healthcare data, enabling smarter strategies and better patient outcomes.
