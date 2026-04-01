# 🚀 Quick Reference Guide - Result Feature

## 🔗 URLs (Local Development)

| Page | URL |
|------|-----|
| **Login** | http://localhost:5000/public/login-mobile.html |
| **Select Paper** | http://localhost:5000/public/select-paper.html?phone=1234567890 |
| **GS Result** | http://localhost:5000/public/result.html?phone=1234567890&type=gs |
| **CSAT Result** | http://localhost:5000/public/result.html?phone=1234567890&type=csat |

---

## 📡 API Endpoints

### Student Endpoints
```http
POST /auth/verify-login
Content-Type: application/json
Body: { "phone": "1234567890" }
```

```http
GET /result/gs?phone=1234567890
```

```http
GET /result/csat?phone=1234567890
```

### Admin Endpoints
```http
POST /admin/upload
Content-Type: multipart/form-data
FormData:
  - excelFile: [file]
  - type: "gs" | "csat" | ""
```

```http
GET /admin/users
```

```http
GET /admin/search?query=...
```

---

## 📊 Excel Column Mapping

### For GS/CSAT Results:
| Acceptable Column Names | Maps To |
|------------------------|---------|
| `mobile`, `phone`, `Mobile Number` | mobile |
| `name`, `Name of Student` | name |
| `centre`, `center`, `Exam Centre` | centre |
| `correct`, `Correct Answers` | correct |
| `incorrect`, `Wrong Answers`, `incorrect_answers` | incorrect |
| `blank`, `Unanswered`, `blank_questions` | blank |
| `score`, `Total Score`, `total_marks` | score |

**Example Excel:**
```
| Mobile      | Name       | Centre | Correct | Incorrect | Blank | Score  |
|-------------|------------|--------|---------|-----------|-------|--------|
| 9876543210  | John Doe   | Delhi  | 75      | 15        | 10    | 142.5  |
```

---

## 🧪 Sample Test Data

### GS Result JSON Response:
```json
{
  "_id": "...",
  "mobile": "9876543210",
  "name": "John Doe",
  "centre": "Delhi",
  "correct": 75,
  "incorrect": 15,
  "blank": 10,
  "score": 142.5,
  "timestamp": "2026-03-28T10:00:00Z"
}
```

### Login Request/Response:
```javascript
// Request
POST /auth/verify-login
{ "phone": "9876543210" }

// Response
{
  "message": "Login successful!",
  "phone": "9876543210"
}
```

---

## 🛠️ Common Tasks

### Add New Result Entry (Manual):
```javascript
const ResultGS = require("./models/ResultGS");

await ResultGS.create({
  mobile: "9876543210",
  name: "John Doe",
  centre: "Delhi",
  correct: 80,
  incorrect: 12,
  blank: 8,
  score: 154
});
```

### Find Result by Mobile:
```javascript
const result = await ResultGS.findOne({ mobile: "9876543210" });
```

### Bulk Upload from Code:
```javascript
const results = [
  { mobile: "9876543210", name: "John", centre: "Delhi", correct: 75, incorrect: 15, blank: 10, score: 142.5 },
  { mobile: "9876543211", name: "Jane", centre: "Mumbai", correct: 80, incorrect: 12, blank: 8, score: 154 }
];

const operations = results.map(r => ({
  updateOne: {
    filter: { mobile: r.mobile },
    update: { $set: r },
    upsert: true
  }
}));

await ResultGS.bulkWrite(operations);
```

---

## 🐛 Troubleshooting

### "Result not found" Error
**Check:**
1. Mobile number format (10 digits exactly)
2. Data exists in correct collection (ResultGS vs ResultCSAT)
3. No extra spaces in mobile number

### Excel Upload Not Working
**Check:**
1. File is `.xlsx` or `.xls` format
2. `type` parameter is included (`"gs"` or `"csat"`)
3. Column headers are readable (not merged cells)
4. First row contains column names

### Login Redirects But No Data Shows
**Check:**
1. Phone number in URL is encoded properly
2. API endpoint is reachable (check console logs)
3. CORS is enabled for your frontend domain

---

## 🎨 UI Customization

### Change Theme Colors:
Edit CSS in each HTML file:
```css
/* Primary Navy Blue */
background: #0b1b3b;

/* GS Paper Red */
color: #dc2626;

/* CSAT Paper Blue */
color: #2563eb;
```

### Modify Table Layout:
Edit `result.html`:
```html
<!-- Adjust column widths -->
<td style="width: 40%;">Centre</td>
<td style="width: 60%;">Delhi</td>
```

---

## 📦 Database Collections

| Collection | Purpose | Indexed Field |
|------------|---------|---------------|
| `users` | Admit card data | email + phone |
| `resultgs` | GS Paper results | mobile |
| `resultcsat` | CSAT Paper results | mobile |

---

## ⚡ Performance Tips

1. **Use `.lean()` queries** → Returns plain JS objects (faster)
2. **Bulk write operations** → Single DB call for 1000+ rows
3. **Mobile index** → Fast lookups on `mobile` field
4. **Connection pooling** → MongoDB handles multiple requests efficiently

---

## 🔐 Security Notes

1. **No authentication** on result endpoints (public access via mobile)
2. **No rate limiting** (consider adding for production)
3. **No input sanitization** needed (mobile is numeric string)
4. **Consider adding**: OTP verification for sensitive data

---

## 📱 Mobile Responsiveness

All pages automatically adjust for:
- **Desktop** (≥1024px) → Full layout
- **Tablet** (768px - 1023px) → Adjusted padding
- **Mobile** (≤767px) → Compact cards
- **Small phones** (≤480px) → Minimal layout

---

## 🎯 Production Checklist

Before deploying to Render:

- [ ] Set `MONGO_URI` in environment variables
- [ ] Set `NODE_ENV=production`
- [ ] Test with production database
- [ ] Verify CORS settings
- [ ] Test file upload limits
- [ ] Enable HTTPS (Render does this automatically)
- [ ] Set up monitoring/logging

---

## 📞 Support Commands

### Check Server Status:
```bash
curl http://localhost:5000
```

### Test API Endpoint:
```bash
curl http://localhost:5000/result/gs?phone=1234567890
```

### View MongoDB Collections:
```javascript
// In MongoDB Compass or shell
db.users.countDocuments()
db.resultgs.countDocuments()
db.resultcsat.countDocuments()
```

---

## 🎉 Success Indicators

You'll know it's working when:
- ✅ Login accepts only mobile number
- ✅ Paper selection page shows two options
- ✅ Clicking GS shows red-themed result
- ✅ Clicking CSAT shows blue-themed result
- ✅ Admin can upload GS and CSAT separately
- ✅ Existing admit card system still works

---

**Quick Start Command:**
```bash
# Start server
npm start

# Open in browser
http://localhost:5000/public/login-mobile.html
```

---

**Version:** 3.0  
**Last Updated:** March 28, 2026  
**Status:** ✅ Production Ready
