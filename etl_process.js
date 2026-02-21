const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const xpath = require('xpath');
const dom = require('xmldom').DOMParser;

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres', 
    password: 'REMOVED_FOR_SECURITY', // Make sure this is the port 5433 password!
    port: 5433,
});

const select = xpath.useNamespaces({ "hl7": "urn:hl7-org:v3" });

async function startProject() {
    console.log("1. Starting ETL process...");
    const dataPath = path.join(__dirname, 'data');
    const files = fs.readdirSync(dataPath).filter(f => f.endsWith('.xml'));
    
    for (let file of files) {
        const xml = fs.readFileSync(path.join(dataPath, file), 'utf8');
        const doc = new dom().parseFromString(xml);

        // --- 1. EXTRACT PATIENT DEMOGRAPHICS ---
        const extId = select("//hl7:patientRole/hl7:id[1]/@extension", doc, true)?.value;
        const fName = select("//hl7:patient/hl7:name/hl7:given/text()", doc, true)?.data;
        const lName = select("//hl7:patient/hl7:name/hl7:family/text()", doc, true)?.data;

        try {
            // --- 2. LOAD PATIENT TO DATABASE ---
            await pool.query(
                'INSERT INTO patients (external_id, first_name, last_name) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
                [extId, fName, lName]
            );

            // --- 3. EXTRACT CLINICAL OBSERVATIONS ---
            // Find every observation node in the entire XML file
            const obsNodes = select("//hl7:observation", doc);
            let obsCount = 0;

            for (let node of obsNodes) {
                const obsName = select("hl7:code/@displayName", node, true)?.value;
                const obsValue = select("hl7:value/@value", node, true)?.value;
                const obsUnit = select("hl7:value/@unit", node, true)?.value || '';
                const rawTime = select("hl7:effectiveTime/@value", node, true)?.value;

                // Only insert if the observation actually has a value (ignores empty records)
                if (obsName && obsValue && rawTime) {
                    // Convert "20180416212254" to a SQL-friendly timestamp
                    const formattedTime = `${rawTime.substring(0,4)}-${rawTime.substring(4,6)}-${rawTime.substring(6,8)} ${rawTime.substring(8,10)}:${rawTime.substring(10,12)}:${rawTime.substring(12,14)}`;

                    // --- 4. LOAD OBSERVATION TO DATABASE ---
                    await pool.query(
                        'INSERT INTO observations (patient_external_id, observation_name, observation_value, units, effective_time) VALUES ($1, $2, $3, $4, $5)',
                        [extId, obsName, obsValue, obsUnit, formattedTime]
                    );
                    obsCount++;
                }
            }
            console.log(`Successfully processed: ${fName} ${lName} | Loaded ${obsCount} observations.`);

        } catch (err) {
            console.error(`Error processing ${file}: ${err.message}`);
        }
    }

    console.log("ETL Finished! Check pgAdmin now.");
    await pool.end();
}

startProject();