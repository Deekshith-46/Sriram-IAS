# 📊 Multi-Sheet Excel Upload Guide

## Overview
The system now supports uploading a **single Excel file containing 8 sheets** for result data. Each sheet is automatically routed to the correct collection (GS or CSAT) based on its sheet name.

---

## 📋 Supported Sheet Names

### GS Paper Sheets (4 sheets)
1. **NEW DELHI GS**
2. **PUNE GS**
3. **HYDERABAD GS**
4. **GS ONLINE**

### CSAT Paper Sheets (4 sheets)
1. **NEW DELHI CSAT**
2. **PUNE CSAT**
3. **HYDERABAD CSAT**
4. **CSAT ONLINE**

---

## 📑 Sheet Field Structures

### Offline Sheets (NEW DELHI, PUNE, HYDERABAD)
These sheets contain the **Centre** field:

| Field | Description | Example |
|-------|-------------|---------|
| Mob No | Mobile number (required) | 9876543210 |
| Centre | Exam centre name | New Delhi |
| Candidate Name | Student's full name | Rahul Kumar |
| Correct | Number of correct answers | 45 |
| Incorrect | Number of incorrect answers | 10 |
| Blank | Number of blank questions | 5 |
| Score | Total score | 120.5 |
| Rank | All India Rank | 150 |
| Mode | Online/Offline | Offline |

### Online Sheets (GS ONLINE, CSAT ONLINE)
These sheets **do NOT contain** the Centre field:

| Field | Description | Example |
|-------|-------------|---------|
| Mob No | Mobile number (required) | 9876543210 |
| Candidate Name | Student's full name | Priya Singh |
| Mode | Online/Offline | Online |
| Correct | Number of correct answers | 50 |
| Incorrect | Number of incorrect answers | 8 |
| Blank | Number of blank questions | 2 |
| Score | Total score | 135.0 |
| Rank | All India Rank | 85 |

---

## 🚀 Upload Instructions

### API Endpoint
```
POST /admin/upload
```

### Request Format
**Content-Type:** `multipart/form-data`

**Fields:**
- `file` (required): Excel file (.xlsx or .xls) containing all 8 sheets

### cURL Example
```bash
curl -X POST http://localhost:5000/admin/upload \
  -F "file=@results.xlsx"
```

### JavaScript/Fetch Example
```javascript
const formData = new FormData();
formData.append('file', excelFile);

const response = await fetch('http://localhost:5000/admin/upload', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log(result);
```

---

## 📊 Upload Process

### Step-by-Step Flow

1. **Upload Single Excel File**
   - File contains all 8 sheets (GS + CSAT)
   - NO `type` parameter needed
   - System reads all sheets automatically

2. **Automatic Sheet Classification**
   - Each sheet is identified by its name
   - GS sheets (4) → `ResultGS` collection
   - CSAT sheets (4) → `ResultCSAT` collection
   - Routing happens automatically based on sheet name

3. **Data Processing**
   - Mobile number is extracted and cleaned (removes spaces, dots, dashes)
   - Rows without mobile numbers are **skipped**
   - All other data is preserved

4. **Bulk Database Insert/Update**
   - Uses MongoDB `bulkWrite` for super-fast processing
   - Handles duplicates automatically (upsert operation)
   - Each record is stored with its `sheetName` for tracking

5. **Detailed Response**
   - Returns statistics for each collection
   - Shows sheets processed, rows inserted/updated

---

## ✅ Response Format

### Success Response (200 OK)
```json
{
  "message": "Multi-sheet result upload completed successfully 🚀",
  "sheetsProcessed": [
    "NEW DELHI GS",
    "PUNE GS",
    "HYDERABAD GS",
    "GS ONLINE",
    "NEW DELHI CSAT",
    "PUNE CSAT",
    "HYDERABAD CSAT",
    "CSAT ONLINE"
  ],
  "totalRowsProcessed": 4501,
  "totalRowsSkipped": 64,
  "gs": {
    "totalInserted": 2927,
    "totalUpdated": 21,
    "totalRecords": 2948,
    "sheets": {
      "NEW DELHI GS": {
        "totalRecords": 850,
        "inserted": 820,
        "updated": 5
      },
      "PUNE GS": {
        "totalRecords": 720,
        "inserted": 700,
        "updated": 8
      },
      "HYDERABAD GS": {
        "totalRecords": 650,
        "inserted": 635,
        "updated": 3
      },
      "GS ONLINE": {
        "totalRecords": 772,
        "inserted": 772,
        "updated": 5
      }
    }
  },
  "csat": {
    "totalInserted": 1551,
    "totalUpdated": 2,
    "totalRecords": 1553,
    "sheets": {
      "NEW DELHI CSAT": {
        "totalRecords": 420,
        "inserted": 415,
        "updated": 1
      },
      "PUNE CSAT": {
        "totalRecords": 380,
        "inserted": 378,
        "updated": 0
      },
      "HYDERABAD CSAT": {
        "totalRecords": 295,
        "inserted": 295,
        "updated": 0
      },
      "CSAT ONLINE": {
        "totalRecords": 470,
        "inserted": 463,
        "updated": 1
      }
    }
  }
}
```

---

## 🔄 Duplicate Handling

### How Duplicates Are Managed
- **Unique Key Combination:** `mobile` + `sheetName`
- **Upsert Operation:** 
  - If record exists (same mobile in same sheet) → **Updates** existing record
  - If record doesn't exist → **Inserts** new record

### Example Scenario
```
First Upload:
- Mobile: 9876543210 in "NEW DELHI GS" → INSERTED

Second Upload (same file):
- Mobile: 9876543210 in "NEW DELHI GS" → UPDATED (no duplicate created)
- Mobile: 9876543211 in "NEW DELHI GS" → INSERTED (new record)
```

---

## 📦 Data Storage

### Collections Used
1. **ResultGS** - All GS paper results (4 sheets combined)
2. **ResultCSAT** - All CSAT paper results (4 sheets combined)

### Document Structure

#### GS Record Example
```json
{
  "_id": "...",
  "mobile": "9876543210",
  "name": "Rahul Kumar",
  "centre": "New Delhi",
  "correct": 45,
  "incorrect": 10,
  "blank": 5,
  "score": 120.5,
  "rank": 150,
  "mode": "Offline",
  "sheetName": "NEW DELHI GS",
  "timestamp": "2026-04-03T10:30:00.000Z"
}
```

#### CSAT Record Example
```json
{
  "_id": "...",
  "mobile": "9876543211",
  "name": "Priya Singh",
  "centre": "Pune",
  "correct": 50,
  "incorrect": 8,
  "blank": 2,
  "score": 135.0,
  "rank": 85,
  "mode": "Offline",
  "sheetName": "PUNE CSAT",
  "timestamp": "2026-04-03T10:30:00.000Z"
}
```

#### Online Record Example (No Centre)
```json
{
  "_id": "...",
  "mobile": "9876543212",
  "name": "Amit Sharma",
  "centre": "",  // Empty for online sheets
  "correct": 55,
  "incorrect": 5,
  "blank": 0,
  "score": 145.0,
  "rank": 45,
  "mode": "Online",
  "sheetName": "GS ONLINE",
  "timestamp": "2026-04-03T10:30:00.000Z"
}
```

---

## ⚡ Performance Features

1. **Bulk Write Operations**
   - Single database call per collection
   - Extremely fast processing (handles 1000+ records in seconds)

2. **Efficient Memory Usage**
   - Processes sheets sequentially
   - No unnecessary data duplication

3. **Smart Field Normalization**
   - Handles various column name formats:
     - `Mob No`, `Mobile`, `Phone`, `MobNo`, `mobile` → All mapped correctly
   - Removes special characters from mobile numbers

4. **Comprehensive Logging**
   - Real-time console output during upload
   - Shows progress for each sheet
   - Detailed summary at the end

---

## 🛡️ Data Validation

### Skipped Rows
- ❌ Rows **without mobile number** are skipped
- ❌ Rows with empty mobile field are skipped
- ✅ All other rows are processed

### Field Defaults
- `correct`: 0 (if empty)
- `incorrect`: 0 (if empty)
- `blank`: 0 (if empty)
- `score`: 0 (if empty)
- `rank`: null (if empty)
- `centre`: "" (empty string for online sheets)

---

## 🔍 Console Output Example

```
📊 Excel file loaded. Sheets found: [
  'NEW DELHI GS', 'PUNE GS', 
  'HYDERABAD GS', 'GS ONLINE', 
  'NEW DELHI CSAT', 'PUNE CSAT', 
  'HYDERABAD CSAT', 'CSAT ONLINE'
]

📄 Processing sheet: "NEW DELHI GS" - 150 rows
📄 Processing sheet: "PUNE GS" - 120 rows
📄 Processing sheet: "HYDERABAD GS" - 95 rows
📄 Processing sheet: "GS ONLINE" - 200 rows
📄 Processing sheet: "NEW DELHI CSAT" - 140 rows
📄 Processing sheet: "PUNE CSAT" - 110 rows
📄 Processing sheet: "HYDERABAD CSAT" - 85 rows
📄 Processing sheet: "CSAT ONLINE" - 180 rows

============================================================
📊 UPLOAD SUMMARY
============================================================

📤 Uploading 150 records to GS collection - Sheet: "NEW DELHI GS"
   ✅ Inserted: 120, Updated: 30

📤 Uploading 120 records to GS collection - Sheet: "PUNE GS"
   ✅ Inserted: 100, Updated: 20

... (continues for all sheets)

============================================================
📊 FINAL STATISTICS
============================================================
Total rows processed: 1080
Total rows skipped (no mobile): 15
GS - Inserted: 450, Updated: 180
CSAT - Inserted: 380, Updated: 225
============================================================
```

---

## 📝 Important Notes

1. **Sheet Names Must Match Exactly**
   - Case-insensitive matching is applied
   - "NEW DELHI GS" = "new delhi gs" = "New Delhi GS"

2. **Mobile Number is Mandatory**
   - Only rows with mobile numbers are stored
   - Mobile numbers are cleaned (only digits retained)

3. **All Data is Preserved**
   - No data is skipped (except rows without mobile)
   - Every row from every sheet is processed

4. **Idempotent Uploads**
   - Safe to upload the same file multiple times
   - Duplicates are automatically handled

5. **Separate Collections**
   - GS data → ResultGS collection
   - CSAT data → ResultCSAT collection
   - Data is NOT mixed between collections

---

## 🎯 Testing Checklist

- [ ] Excel file has exactly 8 sheets
- [ ] Sheet names match the required format
- [ ] Mobile numbers are present in all rows
- [ ] API endpoint is `/admin/upload`
- [ ] `type` parameter is set to `'gs'` or `'csat'`
- [ ] Response shows all sheets processed
- [ ] Database contains correct number of records
- [ ] Duplicate uploads don't create extra records

---

## 🚨 Troubleshooting

### Issue: "Some sheets not processed"
**Solution:** Check sheet names match exactly (case-insensitive)

### Issue: "Fewer records than expected"
**Solution:** Check for rows without mobile numbers (they are skipped)

### Issue: "Upload is slow"
**Solution:** Normal for large files. System uses bulk operations for maximum speed.

### Issue: "Duplicate records created"
**Solution:** This shouldn't happen. Check if mobile numbers are being cleaned properly.

---

**Last Updated:** April 3, 2026  
**Version:** 4.0 (Multi-Sheet Upload)  
**Status:** ✅ Production Ready
