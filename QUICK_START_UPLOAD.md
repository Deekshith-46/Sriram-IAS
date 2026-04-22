# 🚀 Quick Start - Excel Upload

## Simple Upload (Updated Format)

### API Endpoint
```
POST /admin/upload
```

### Request
```
FormData:
  - file: your-excel-file.xlsx
```

**That's it!** Just upload the file. NO `type` parameter needed.

---

## What's Inside Your Excel File?

Your single Excel file contains **8 sheets**:

### GS Sheets (4) → Auto-routed to ResultGS Collection
- NEW DELHI GS
- PUNE GS
- HYDERABAD GS
- GS ONLINE

### CSAT Sheets (4) → Auto-routed to ResultCSAT Collection
- NEW DELHI CSAT
- PUNE CSAT
- HYDERABAD CSAT
- CSAT ONLINE

---

## How It Works

```
Upload 1 Excel File
        ↓
System Reads All 8 Sheets
        ↓
Auto-Detect Sheet Names
        ↓
    ┌───────────────┬───────────────┐
    │  GS Sheets    │  CSAT Sheets  │
    │   (4 sheets)  │   (4 sheets)  │
    ↓               ↓               ↓
ResultGS        ResultCSAT
Collection      Collection
```

---

## Example Usage

### Using cURL
```bash
curl -X POST http://localhost:5000/admin/upload \
  -F "file=@results.xlsx"
```

### Using JavaScript
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

### Using Postman
1. Method: POST
2. URL: http://localhost:5000/admin/upload
3. Body → form-data
4. Key: `file`, Type: File, Value: [Select your Excel file]
5. Click Send

---

## Response You'll Get

```json
{
  "message": "Multi-sheet result upload completed successfully 🚀",
  "sheetsProcessed": ["NEW DELHI GS", "PUNE GS", "HYDERABAD GS", "GS ONLINE", ...],
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

**Response includes:**
- ✅ Total rows processed and skipped
- ✅ GS & CSAT totals (inserted, updated, total records)
- ✅ **Detailed per-sheet statistics** (totalRecords, inserted, updated)

---

## Key Points

✅ **Single file upload** - All 8 sheets in one Excel file  
✅ **NO type parameter** - System auto-detects everything  
✅ **Fast processing** - Bulk database operations  
✅ **No data loss** - All rows processed (except those without mobile)  
✅ **Duplicate safe** - Can upload same file multiple times  

---

## Need Help?

- Check console logs for detailed upload progress
- Verify sheet names match exactly (case-insensitive)
- Ensure mobile numbers are present in all rows

---

**Status:** ✅ Ready to Use  
**Updated:** April 3, 2026
