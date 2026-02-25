const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const format = require('pg-format'); // Tool for building big "batch" queries

// 1. THE CONNECTION: Telling Node.js where the database lives
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'trella_csv_db',
    password: 'PasswordMAskedForSecurity', // Make sure this is the port 5433 password!
    port: 5433,
    max: 20, // Only allow 20 connections at once so we don't crash the DB
});

async function startCsvEtl() {
    console.log("🚀 Starting Optimized CSV Extraction...");
    const filePath = path.join(__dirname, 'csv_data', 'patients.csv');
    
    let batch = [];
    const BATCH_SIZE = 500; // We send rows in groups of 500 for speed
    let totalProcessed = 0;

    // 2. THE STREAM: Reading the file piece-by-piece to save memory
    const stream = fs.createReadStream(filePath)
        .pipe(csv({
            // This function cleans the CSV headers (lowercase, no spaces)
            mapHeaders: ({ header }) => header.toLowerCase().trim().replace(/ /g, '_')
        }));

    // 3. THE LOOP: This "for await" pauses until the stream gives us a row
    for await (const row of stream) {
        // 🧪 THE MAPPING: Connecting CSV data to our Database columns
        // The order here MUST match the order in our INSERT statement below
        const values = [
    row.id, 
    row.birthdate, 
    row.deathdate || null, 
    row.ssn, 
    row.drivers,    // ✅ Fixed from drivers_license
    row.passport, 
    row.prefix, 
    row.first,      // ✅ Fixed from first_name
    row.middle,     // ✅ Fixed from midlle
    row.last,       // ✅ Fixed from last_name
    row.suffix, 
    row.maiden, 
    row.marital, 
    row.race, 
    row.ethnicity,
    row.gender, 
    row.birthplace, 
    row.address, 
    row.city, 
    row.state,
    row.county,     // ✅ Fixed from country
    row.fips, 
    row.zip, 
    row.lat, 
    row.lon,
    row.healthcare_expenses || null, 
    row.healthcare_coverage || null, 
    row.income || null
];

        batch.push(values); // Add this row to our current group

        // 4. THE BATCH TRIGGER: Once we have 500 rows, send them all!
        if (batch.length >= BATCH_SIZE) {
            await insertBatch(batch);
            totalProcessed += batch.length;
            console.log(`📦 Log: Processed ${totalProcessed} rows...`);
            batch = []; // Empty the group to start fresh
        }
    }

    // 5. THE CLEANUP: Send any remaining rows (e.g., the last 11 rows)
    if (batch.length > 0) {
        await insertBatch(batch);
        totalProcessed += batch.length;
    }

    console.log(`✅ Finished. Total rows processed: ${totalProcessed}`);
    await pool.end();
}

// 6. THE WORKER: This function actually talks to PostgreSQL
async function insertBatch(rows) {
    const query = format(`
        INSERT INTO csv_patients (
            id, birthdate, deathdate, ssn, drivers, -- 👈 Changed from drivers_license
            passport, prefix, first, middle, last,  -- 👈 Match your SQL names
            suffix, maiden, marital, race, ethnicity, 
            gender, birthplace, address, city, state, 
            county, fips, zip, lat, lon, 
            healthcare_expenses, healthcare_coverage, income
        ) VALUES %L
        ON CONFLICT (id) DO NOTHING`, rows);

    try {
        await pool.query(query);
    } catch (err) {
        console.error("❌ Batch insert error:", err.message);
    }
}

startCsvEtl();