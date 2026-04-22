# 🚀 Quick Reference - Data Listing APIs

## 📋 Available Endpoints

### 1. Get All GS Results
```
GET /result/gs/all
```
**Optional Filters:**
- `?sheet=NEW DELHI GS`
- `?centre=Pune`
- `?mode=Online`

### 2. Get All CSAT Results
```
GET /result/csat/all
```
**Optional Filters:**
- `?sheet=PUNE CSAT`
- `?centre=Hyderabad`
- `?mode=Offline`

### 3. Get Statistics
```
GET /result/stats
```
**No parameters needed**

---

## 💻 Quick Examples

### Get All GS Data
```bash
curl http://localhost:5000/result/gs/all
```

### Get Specific Sheet
```bash
curl "http://localhost:5000/result/gs/all?sheet=NEW%20DELHI%20GS"
```

### Get Statistics
```bash
curl http://localhost:5000/result/stats
```

---

## 📊 Response Format

### Data Response
```json
{
  "success": true,
  "count": 850,
  "data": [
    {
      "mobile": "9876543210",
      "name": "Rahul Kumar",
      "centre": "New Delhi",
      "score": 120.5,
      "rank": 150,
      "sheetName": "NEW DELHI GS"
    }
  ]
}
```

### Statistics Response
```json
{
  "success": true,
  "totals": {
    "gs": 2948,
    "csat": 1553
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
      }
    ]
  }
}
```

---

## 🎯 Common Queries

**All online students:**
```
/result/gs/all?mode=Online
```

**All from specific centre:**
```
/result/csat/all?centre=Pune
```

**Specific sheet:**
```
/result/gs/all?sheet=GS%20ONLINE
```

---

## 📱 Sheet Names

**GS:**
- NEW DELHI GS
- PUNE GS
- HYDERABAD GS
- GS ONLINE

**CSAT:**
- NEW DELHI CSAT
- PUNE CSAT
- HYDERABAD CSAT
- CSAT ONLINE

---

**Ready to use!** 🚀
