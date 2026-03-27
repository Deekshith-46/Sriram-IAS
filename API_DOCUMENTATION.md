# 📚 Anubhuti II Backend API - Complete Documentation

Complete documentation for all API endpoints with step-by-step examples.

---

## 📋 Table of Contents

1. [Authentication APIs](#authentication-apis)
2. [Admin APIs](#admin-apis)
3. [Admit Card APIs](#admit-card-apis)
4. [Error Handling](#error-handling)
5. [Testing Guide](#testing-guide)

---

## 🔐 Authentication APIs

### 1. Verify Login (Phone + Email)

**Endpoint:** `POST /auth/verify-login`

**Purpose:** Verifies user credentials using phone number and email address.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "phone": "9876543210",
  "email": "user@example.com"
}
```

**Step-by-Step Process:**

1. **Send POST request** to `http://localhost:5000/auth/verify-login`
2. **Include both phone and email** in the request body
3. **System validates** that both fields exist in database
4. **Returns user data** if credentials match

**Success Response (200 OK):**
```json
{
  "message": "Login successful!",
  "user": {
    "name": "Navin Yadav",
    "email": "navin@example.com",
    "phone": "9876543210",
    "preferredMode": "Offline",
    "city": "Delhi",
    "timestamp": "21/02/2026",
    "gsPaperSlot": "General Studies"
  }
}
```

**Error Responses:**

**400 Bad Request** - Missing fields:
```json
{
  "message": "Phone number and email are required"
}
```

**404 Not Found** - Invalid credentials:
```json
{
  "message": "User not found. Please check your credentials."
}
```

**500 Server Error:**
```json
{
  "message": "Error verifying credentials",
  "error": "Detailed error message"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5000/auth/verify-login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "9876543210",
    "email": "navin@example.com"
  }'
```

**JavaScript (Fetch) Example:**
```javascript
const response = await fetch('http://localhost:5000/auth/verify-login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    phone: '9876543210',
    email: 'navin@example.com'
  })
});

const data = await response.json();
console.log(data);
```

**Postman Instructions:**
1. Set method to **POST**
2. Enter URL: `http://localhost:5000/auth/verify-login`
3. Go to **Body** tab → Select **raw** → Choose **JSON**
4. Add phone and email fields
5. Click **Send**

---

## 👨‍💼 Admin APIs

### 2. Get All Users

**Endpoint:** `GET /admin/users`

**Purpose:** Retrieves all users from the database (for admin purposes).

**Request Headers:** None

**Query Parameters:** None

**Step-by-Step Process:**

1. **Send GET request** to `http://localhost:5000/admin/users`
2. **System queries** MongoDB for all users
3. **Excludes sensitive fields** (OTP, OTP expiry)
4. **Returns array** of all users with count

**Success Response (200 OK):**
```json
{
  "success": true,
  "count": 150,
  "data": [
    {
      "_id": "64f5a1b2c3d4e5f6g7h8i9j0",
      "name": "Navin Yadav",
      "phone": "9876543210",
      "email": "navin@example.com",
      "preferredMode": "Offline",
      "city": "Delhi",
      "timestamp": "21/02/2026",
      "gsPaperSlot": "General Studies"
    },
    {
      "_id": "64f5a1b2c3d4e5f6g7h8i9j1",
      "name": "Priya Sharma",
      "phone": "9123456789",
      "email": "priya@example.com",
      "preferredMode": "Online",
      "city": "Mumbai",
      "timestamp": "22/02/2026",
      "gsPaperSlot": "History"
    }
    // ... more users
  ]
}
```

**Error Response (500 Server Error):**
```json
{
  "success": false,
  "message": "Failed to fetch users",
  "error": "Detailed error message"
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:5000/admin/users
```

**JavaScript (Fetch) Example:**
```javascript
const response = await fetch('http://localhost:5000/admin/users');
const data = await response.json();
console.log(`Total users: ${data.count}`);
console.log(data.data);
```

**Postman Instructions:**
1. Set method to **GET**
2. Enter URL: `http://localhost:5000/admin/users`
3. Click **Send**
4. View list of all users

---

### 3. Upload Excel File

**Endpoint:** `POST /admin/upload`

**Purpose:** Bulk upload user data from Excel file (.xlsx format).

**Request Headers:**
```
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
```
file: [Excel file]
key: form-data
value: file
```

**Step-by-Step Process:**

1. **Prepare Excel file** with columns:
   - Name
   - PhoneNumber
   - EmailID
   - PreferredMode
   - City
   - Timestamp
   - GSPaperISlot

2. **Send POST request** with file attached
3. **System reads Excel** and normalizes column names
4. **Bulk upserts** data into database
5. **Returns statistics** (total, inserted, updated)

**Success Response (200 OK):**
```json
{
  "message": "Upload processed SUPER FAST 🚀",
  "total": 150,
  "inserted": 45,
  "updated": 105
}
```

**Error Responses:**

**400 Bad Request** - No file uploaded:
```json
{
  "message": "No file uploaded"
}
```

**500 Server Error:**
```json
{
  "message": "Upload failed",
  "error": "Detailed error message"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5000/admin/upload \
  -F "file=@/path/to/your/excel.xlsx"
```

**JavaScript (FormData) Example:**
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('http://localhost:5000/admin/upload', {
  method: 'POST',
  body: formData
});

const data = await response.json();
console.log(data);
```

**Postman Instructions:**
1. Set method to **POST**
2. Enter URL: `http://localhost:5000/admin/upload`
3. Go to **Body** tab → Select **form-data**
4. Add key: `file`, type: **File**, value: **[Select File]**
5. Choose your Excel file
6. Click **Send**

**Excel Template Format:**

| Name | PhoneNumber | EmailID | PreferredMode | City | Timestamp | GSPaperISlot |
|------|-------------|---------|---------------|------|-----------|--------------|
| Navin Yadav | 9876543210 | navin@example.com | Offline | Delhi | 21/02/2026 | General Studies |
| Priya Sharma | 9123456789 | priya@example.com | Online | Mumbai | 22/02/2026 | History |

**Important Notes:**
- ✅ Column names are automatically normalized (case-insensitive, spaces/dashes removed)
- ✅ Duplicate entries (same email + phone) are updated
- ✅ New entries are inserted
- ✅ Excel dates are automatically converted to readable format

---

### 4. Search Users

**Endpoint:** `GET /admin/search?query=...`

**Purpose:** Search users by name, phone, or email.

**Request Headers:** None

**Query Parameters:**
```
query: string (required)
```

**Step-by-Step Process:**

1. **Send GET request** with search query
2. **System searches** across name, phone, and email fields
3. **Returns matching users** (case-insensitive for name/email)

**Success Response (200 OK):**
```json
[
  {
    "_id": "64f5a1b2c3d4e5f6g7h8i9j0",
    "name": "Navin Yadav",
    "phone": "9876543210",
    "email": "navin@example.com",
    "preferredMode": "Offline",
    "city": "Delhi",
    "timestamp": "21/02/2026",
    "gsPaperSlot": "General Studies"
  }
]
```

**Error Responses:**

**400 Bad Request** - Missing query:
```json
{
  "message": "Search query required"
}
```

**500 Server Error:**
```json
{
  "message": "Error searching users",
  "error": "Detailed error message"
}
```

**cURL Examples:**
```bash
# Search by name
curl "http://localhost:5000/admin/search?query=Navin"

# Search by phone
curl "http://localhost:5000/admin/search?query=9876543210"

# Search by email
curl "http://localhost:5000/admin/search?query=navin@example.com"
```

**JavaScript Example:**
```javascript
const query = 'Navin';
const response = await fetch(`http://localhost:5000/admin/search?query=${query}`);
const users = await response.json();
console.log(users);
```

**Postman Instructions:**
1. Set method to **GET**
2. Enter URL: `http://localhost:5000/admin/search?query=Navin`
3. Click **Send**

---

## 📄 Admit Card APIs

### 5. Download Admit Card

**Endpoint:** `GET /admit/download?email=...`

**Purpose:** Generate and download personalized admit card PDF.

**Request Headers:** None

**Query Parameters:**
```
email: string (required)
```

**Step-by-Step Process:**

1. **Send GET request** with user's email
2. **System finds user** in database
3. **Loads PDF template** from templates folder
4. **Overlays user data** at predefined positions
5. **Returns PDF file** for download

**Success Response (200 OK):**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="admit-card-Navin-Yadav.pdf"

[Binary PDF data]
```

**Error Responses:**

**400 Bad Request** - Missing email:
```json
{
  "message": "Email is required"
}
```

**404 Not Found** - User not found:
```json
{
  "message": "User not found"
}
```

**500 Server Error:**
```json
{
  "message": "Error downloading admit card",
  "error": "Detailed error message"
}
```

**cURL Example:**
```bash
curl "http://localhost:5000/admit/download?email=navin@example.com" \
  --output admit-card.pdf
```

**JavaScript Example:**
```javascript
// Option 1: Download directly
window.open('http://localhost:5000/admit/download?email=navin@example.com', '_blank');

// Option 2: Fetch and save
const response = await fetch('http://localhost:5000/admit/download?email=navin@example.com');
const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'admit-card.pdf';
a.click();
```

**Postman Instructions:**
1. Set method to **GET**
2. Enter URL: `http://localhost:5000/admit/download?email=navin@example.com`
3. Click **Send and Download** (to save PDF)

**PDF Content Preview:**
```
┌──────────────────────────────────────┐
│         ANUBHUTI II                  │
│         Admit Card                   │
├──────────────────────────────────────┤
│                                      │
│  Name:              Navin Yadav      │
│                                      │
│  Mobile No:         9876543210       │
│                                      │
│  Venue:             21/02/2026,      │
│                     Offline, Delhi   │
│                                      │
│  Examination Timing:                 │
│  Paper I (General Studies)           │
│  - 9:30 AM - 11:30 AM                │
│  Paper II (CSAT)                     │
│  - 2:30 PM - 4:30 PM                 │
│                                      │
│  Important Instructions:             │
│  1. Please arrive 30 min early       │
│  2. Bring valid photo ID             │
│  3. Preserve admit card              │
│  4. No electronics allowed           │
└──────────────────────────────────────┘
```

---

## ❌ Error Handling

### Common Error Codes

| Code | Meaning | Typical Cause |
|------|---------|---------------|
| 200 | OK | Success |
| 400 | Bad Request | Missing required fields |
| 404 | Not Found | User doesn't exist |
| 500 | Server Error | Database/connection issue |

### Standard Error Response Format

```json
{
  "message": "Human-readable error message",
  "error": "Technical error details"
}
```

### Error Handling Best Practices

**Frontend Example:**
```javascript
try {
  const response = await fetch('http://localhost:5000/auth/verify-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, email })
  });

  const data = await response.json();

  if (!response.ok) {
    // Handle error
    alert(data.message || 'Login failed');
    return;
  }

  // Success
  console.log('Login successful:', data.user);

} catch (error) {
  // Network error
  alert('Network error. Please try again.');
}
```

---

## 🧪 Testing Guide

### Using Postman Collection

**Import Collection:**
1. Open Postman
2. Click **Import**
3. Select `postman-collection.json` from project root
4. Collection appears in sidebar

**Test All Endpoints:**
1. Expand "Anubhuti II Backend" collection
2. Run requests in order:
   - Upload Excel (admin)
   - Get All Users (admin)
   - Verify Login (auth)
   - Download Admit Card (admit)

### Using cURL

**Complete Test Flow:**
```bash
# 1. Upload Excel file
curl -X POST http://localhost:5000/admin/upload \
  -F "file=@sample-data.xlsx"

# 2. Verify all users uploaded
curl http://localhost:5000/admin/users

# 3. Test login
curl -X POST http://localhost:5000/auth/verify-login \
  -H "Content-Type: application/json" \
  -d '{"phone":"9876543210","email":"navin@example.com"}'

# 4. Download admit card
curl "http://localhost:5000/admit/download?email=navin@example.com" \
  --output admit-card.pdf
```

### Using Browser

**Test via Browser Console:**
```javascript
// Open browser DevTools (F12)
// Paste and run these commands:

// 1. Get all users
fetch('http://localhost:5000/admin/users')
  .then(r => r.json())
  .then(console.log);

// 2. Test login
fetch('http://localhost:5000/auth/verify-login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    phone: '9876543210',
    email: 'navin@example.com'
  })
})
.then(r => r.json())
.then(console.log);

// 3. Download admit card (opens in new tab)
window.open('http://localhost:5000/admit/download?email=navin@example.com');
```

---

## 🚀 Quick Start Testing

### Step 1: Start Server
```bash
npm start
```
Server runs on: `http://localhost:5000`

### Step 2: Upload Sample Data
```bash
curl -X POST http://localhost:5000/admin/upload \
  -F "file=@sample-data.xlsx"
```

### Step 3: Test Login
Visit: `http://localhost:5000`  
Or use frontend login page

### Step 4: Download Admit Card
After successful login, click download button  
Or visit: `http://localhost:5000/admit/download?email=user@example.com`

---

## 📊 API Summary Table

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| POST | `/auth/verify-login` | User login | No |
| GET | `/admin/users` | Get all users | No* |
| POST | `/admin/upload` | Upload Excel | No* |
| GET | `/admin/search?query=...` | Search users | No* |
| GET | `/admit/download?email=...` | Download PDF | No |

*Note: Currently no authentication middleware. Consider adding admin auth for production.

---

## 💡 Pro Tips

### 1. **Batch Testing**
Use Postman collection runner to test all endpoints at once.

### 2. **Data Validation**
Always verify Excel data before bulk upload:
- Check column names
- Validate email formats
- Ensure phone numbers are correct

### 3. **PDF Customization**
Edit `utils/generatePDF.js` to customize:
- Field positions
- Font sizes
- Colors
- Layout

### 4. **Performance**
- Bulk upload is optimized (single DB call)
- PDF generation is on-the-fly (no file storage needed)
- Search uses MongoDB indexes (fast)

### 5. **Security Considerations**
For production:
- Add JWT authentication
- Implement rate limiting
- Sanitize all inputs
- Use HTTPS
- Add CORS restrictions

---

## 📞 Support

### Common Issues

**Issue:** "Cannot connect to server"  
**Solution:** Ensure server is running: `npm start`

**Issue:** "User not found"  
**Solution:** Upload Excel file first with user data

**Issue:** "PDF not generating"  
**Solution:** Check if template exists: `templates/admit-card-template.pdf`

**Issue:** "Fields misaligned in PDF"  
**Solution:** Adjust FIELD_POSITIONS in `utils/generatePDF.js`

---

## 🎯 Next Steps

1. ✅ Test all endpoints with Postman
2. ✅ Upload sample Excel data
3. ✅ Verify login flow works
4. ✅ Download and check admit card PDF
5. ✅ Customize PDF layout if needed
6. ✅ Deploy to production server

---

**🎉 You're all set! Your backend API is fully functional and documented.**

For more details, see:
- [`README.md`](README.md) - Project overview
- [`QUICKSTART.md`](QUICKSTART.md) - Getting started guide
- [`LOGIN_AND_DOWNLOAD_GUIDE.md`](LOGIN_AND_DOWNLOAD_GUIDE.md) - Login flow documentation
