# 📊 Complete Data Listing APIs

## Overview
These APIs allow you to retrieve complete result data from the database with optional filtering and statistics.

---

## 🔗 API Endpoints

### 1. **Get All GS Results**
```
GET /result/gs/all
```

### 2. **Get All CSAT Results**
```
GET /result/csat/all
```

### 3. **Get Sheet Statistics**
```
GET /result/stats
```

---

## 📋 API Details

### 1️⃣ **GET /result/gs/all** - Complete GS Data

Retrieve all GS results with optional filters.

#### Query Parameters (All Optional)
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `sheet` | String | Filter by sheet name | `NEW DELHI GS` |
| `centre` | String | Filter by centre (case-insensitive) | `New Delhi` |
| `mode` | String | Filter by mode | `Online` or `Offline` |

#### Example Requests

**Get all GS results:**
```bash
GET http://localhost:5000/result/gs/all
```

**Get GS results for specific sheet:**
```bash
GET http://localhost:5000/result/gs/all?sheet=NEW%20DELHI%20GS
```

**Get GS results for specific centre:**
```bash
GET http://localhost:5000/result/gs/all?centre=Pune
```

**Get GS results for online mode only:**
```bash
GET http://localhost:5000/result/gs/all?mode=Online
```

**Combine multiple filters:**
```bash
GET http://localhost:5000/result/gs/all?sheet=PUNE%20GS&mode=Offline
```

#### Response Format
```json
{
  "success": true,
  "count": 850,
  "data": [
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
    },
    // ... more records
  ]
}
```

**Sorting:** Results are sorted by `rank` (ascending), then by `score` (descending).

---

### 2️⃣ **GET /result/csat/all** - Complete CSAT Data

Retrieve all CSAT results with optional filters.

#### Query Parameters (All Optional)
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `sheet` | String | Filter by sheet name | `PUNE CSAT` |
| `centre` | String | Filter by centre (case-insensitive) | `Hyderabad` |
| `mode` | String | Filter by mode | `Online` or `Offline` |

#### Example Requests

**Get all CSAT results:**
```bash
GET http://localhost:5000/result/csat/all
```

**Get CSAT results for specific sheet:**
```bash
GET http://localhost:5000/result/csat/all?sheet=HYDERABAD%20CSAT
```

**Get CSAT results for online mode:**
```bash
GET http://localhost:5000/result/csat/all?mode=Online
```

#### Response Format
```json
{
  "success": true,
  "count": 420,
  "data": [
    {
      "_id": "...",
      "mobile": "9876543211",
      "name": "Priya Singh",
      "centre": "Pune",
      "correct": 50,
      "incorrect": 8,
      "blank": 2,
      "score": 135.0,
      "mode": "Offline",
      "sheetName": "PUNE CSAT",
      "timestamp": "2026-04-03T10:30:00.000Z"
    },
    // ... more records
  ]
}
```

**Sorting:** Results are sorted by `score` (descending).

---

### 3️⃣ **GET /result/stats** - Sheet Statistics

Get comprehensive statistics for all sheets.

#### Request
```bash
GET http://localhost:5000/result/stats
```

**No parameters required.**

#### Response Format
```json
{
  "success": true,
  "totals": {
    "gs": 2948,
    "csat": 1553,
    "combined": 4501
  },
  "gs": {
    "totalRecords": 2948,
    "bySheet": [
      {
        "_id": "NEW DELHI GS",
        "count": 850,
        "avgScore": 118.5,
        "maxScore": 185.0,
        "minScore": 25.0
      },
      {
        "_id": "PUNE GS",
        "count": 720,
        "avgScore": 115.2,
        "maxScore": 180.0,
        "minScore": 30.0
      },
      {
        "_id": "HYDERABAD GS",
        "count": 650,
        "avgScore": 120.8,
        "maxScore": 190.0,
        "minScore": 28.0
      },
      {
        "_id": "GS ONLINE",
        "count": 728,
        "avgScore": 122.3,
        "maxScore": 192.0,
        "minScore": 35.0
      }
    ]
  },
  "csat": {
    "totalRecords": 1553,
    "bySheet": [
      {
        "_id": "NEW DELHI CSAT",
        "count": 420,
        "avgScore": 95.5,
        "maxScore": 150.0,
        "minScore": 20.0
      },
      {
        "_id": "PUNE CSAT",
        "count": 380,
        "avgScore": 92.3,
        "maxScore": 148.0,
        "minScore": 22.0
      },
      {
        "_id": "HYDERABAD CSAT",
        "count": 295,
        "avgScore": 97.1,
        "maxScore": 152.0,
        "minScore": 18.0
      },
      {
        "_id": "CSAT ONLINE",
        "count": 458,
        "avgScore": 98.5,
        "maxScore": 155.0,
        "minScore": 25.0
      }
    ]
  }
}
```

---

## 💡 Usage Examples

### JavaScript/Fetch

#### Get All GS Results
```javascript
const response = await fetch('http://localhost:5000/result/gs/all');
const data = await response.json();
console.log(`Total GS records: ${data.count}`);
console.log('First record:', data.data[0]);
```

#### Get Filtered CSAT Results
```javascript
const response = await fetch('http://localhost:5000/result/csat/all?sheet=CSAT%20ONLINE&mode=Online');
const data = await response.json();
console.log(`Online CSAT records: ${data.count}`);
```

#### Get Statistics
```javascript
const response = await fetch('http://localhost:5000/result/stats');
const stats = await response.json();

console.log('Total GS students:', stats.totals.gs);
console.log('Total CSAT students:', stats.totals.csat);

// Sheet-wise breakdown
stats.gs.bySheet.forEach(sheet => {
  console.log(`${sheet._id}: ${sheet.count} students, Avg: ${sheet.avgScore.toFixed(2)}`);
});
```

### cURL Examples

#### Get All GS Results
```bash
curl http://localhost:5000/result/gs/all
```

#### Get Specific Sheet Data
```bash
curl "http://localhost:5000/result/gs/all?sheet=NEW%20DELHI%20GS"
```

#### Get Statistics
```bash
curl http://localhost:5000/result/stats
```

### Python Example

```python
import requests

# Get all GS results
response = requests.get('http://localhost:5000/result/gs/all')
data = response.json()

print(f"Total GS records: {data['count']}")

# Get statistics
stats_response = requests.get('http://localhost:5000/result/stats')
stats = stats_response.json()

print(f"GS Total: {stats['totals']['gs']}")
print(f"CSAT Total: {stats['totals']['csat']}")
```

---

## 🎯 Common Use Cases

### 1. **Display Leaderboard**
```javascript
// Get top 10 GS students
const response = await fetch('http://localhost:5000/result/gs/all');
const data = await response.json();
const top10 = data.data.slice(0, 10);
console.log('Top 10 GS Students:', top10);
```

### 2. **Sheet-wise Analysis**
```javascript
// Get all sheets statistics
const response = await fetch('http://localhost:5000/result/stats');
const stats = await response.json();

stats.gs.bySheet.forEach(sheet => {
  console.log(`${sheet._id}:`);
  console.log(`  Students: ${sheet.count}`);
  console.log(`  Average Score: ${sheet.avgScore.toFixed(2)}`);
  console.log(`  Highest Score: ${sheet.maxScore}`);
  console.log(`  Lowest Score: ${sheet.minScore}`);
});
```

### 3. **Centre-wise Filtering**
```javascript
// Get all students from specific centre
const response = await fetch('http://localhost:5000/result/gs/all?centre=Hyderabad');
const data = await response.json();
console.log(`Hyderabad GS students: ${data.count}`);
```

### 4. **Online vs Offline Comparison**
```javascript
// Get online results
const onlineRes = await fetch('http://localhost:5000/result/gs/all?mode=Online');
const onlineData = await onlineRes.json();

// Get offline results
const offlineRes = await fetch('http://localhost:5000/result/gs/all?mode=Offline');
const offlineData = await offlineRes.json();

console.log(`Online: ${onlineData.count}, Offline: ${offlineData.count}`);
```

---

## 📊 Response Fields Explained

### GS/CSAT Record Fields
| Field | Type | Description |
|-------|------|-------------|
| `_id` | String | MongoDB document ID |
| `mobile` | String | Student's mobile number |
| `name` | String | Student's name |
| `centre` | String | Exam centre (empty for online) |
| `correct` | Number | Number of correct answers |
| `incorrect` | Number | Number of incorrect answers |
| `blank` | Number | Number of blank questions |
| `score` | Number | Total score |
| `rank` | Number | All India Rank (GS only) |
| `mode` | String | Online or Offline |
| `sheetName` | String | Source sheet name |
| `timestamp` | Date | Record creation date |

### Statistics Fields
| Field | Type | Description |
|-------|------|-------------|
| `count` | Number | Number of students in sheet |
| `avgScore` | Number | Average score |
| `maxScore` | Number | Highest score |
| `minScore` | Number | Lowest score |

---

## ⚡ Performance Tips

1. **Use Filters** - Reduce data transfer by filtering on server
   ```javascript
   // Better: Filter on server
   fetch('/result/gs/all?sheet=NEW%20DELHI%20GS')
   
   // Worse: Fetch all and filter on client
   fetch('/result/gs/all').then(data => filterBySheet(data))
   ```

2. **Pagination** - For large datasets, implement pagination on your frontend
   ```javascript
   const allData = await fetch('/result/gs/all');
   const page1 = allData.data.slice(0, 100);  // First 100 records
   ```

3. **Caching** - Cache statistics as they don't change frequently
   ```javascript
   // Cache stats for 5 minutes
   let cachedStats = null;
   let cacheTime = 0;
   
   async function getStats() {
     const now = Date.now();
     if (!cachedStats || now - cacheTime > 300000) {
       const response = await fetch('/result/stats');
       cachedStats = await response.json();
       cacheTime = now;
     }
     return cachedStats;
   }
   ```

---

## 🔍 Available Sheet Names

### GS Sheets
- `NEW DELHI GS`
- `PUNE GS`
- `HYDERABAD GS`
- `GS ONLINE`

### CSAT Sheets
- `NEW DELHI CSAT`
- `PUNE CSAT`
- `HYDERABAD CSAT`
- `CSAT ONLINE`

---

## ✅ Success Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request (missing required params) |
| 500 | Server Error |

---

## 🚨 Error Responses

```json
{
  "success": false,
  "message": "Error fetching GS results",
  "error": "Detailed error message here"
}
```

---

**Status:** ✅ Production Ready  
**Last Updated:** April 3, 2026
