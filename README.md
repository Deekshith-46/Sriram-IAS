# 🚀 Anubhuti II - Backend System

Complete backend system for managing user registrations, OTP authentication, and dynamic admit card generation.

## 📋 Features

- ✅ **Excel Upload** - Bulk upload user data via Excel
- ✅ **OTP Authentication** - Secure email-based OTP login
- ✅ **Dynamic PDF Generation** - Auto-generate admit cards with custom data
- ✅ **Search Functionality** - Search users by name, phone, or email
- ✅ **MongoDB Integration** - Robust database storage

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB
- **Authentication:** OTP (Email via SendGrid)
- **PDF Generation:** PDFKit
- **Excel Processing:** XLSX
- **Email Service:** SendGrid

## 📦 Installation

### Prerequisites
- Node.js installed
- MongoDB running locally or MongoDB Atlas URI

### Setup Steps

1. **Install dependencies**
```bash
npm install
```

2. **Configure environment variables**

Edit `.env` file:
```env
MONGO_URI=mongodb://localhost:27017/anubhuti-db
PORT=5000
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=your_verified_email@gmail.com
FROM_NAME=Anubhuti II
```

> **Note:** Get your SendGrid API key from https://app.sendgrid.com/settings/api_keys

3. **Start the server**
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

## 📁 Project Structure

```
project/
│── models/
│   └── User.js              # Database schema
│── routes/
│   ├── adminRoutes.js       # Admin endpoints
│   ├── authRoutes.js        # Authentication endpoints
│   └── admitRoutes.js       # Admit card endpoints
│── controllers/
│   ├── adminController.js   # Admin logic
│   ├── authController.js    # Auth logic
│   └── admitController.js   # PDF generation logic
│── utils/
│   ├── sendEmail.js         # Email service
│   └── generatePDF.js       # PDF generator
│── uploads/                 # Temporary file storage
│── server.js                # Main application
│── .env                     # Environment config
│── .gitignore
│── package.json
└── README.md
```

## 🔗 API Endpoints

### 1. Admin Routes (`/admin`)

#### Upload Excel File
```http
POST /admin/upload
Content-Type: multipart/form-data

Body:
  file: [Excel file]
```

**Response:**
```json
{
  "message": "Excel uploaded successfully",
  "count": 50
}
```

#### Search Users
```http
GET /admin/search?query=john
```

**Response:**
```json
[
  {
    "_id": "...",
    "name": "John Doe",
    "phone": "1234567890",
    "email": "john@example.com",
    "preferredMode": "Offline",
    "city": "Delhi",
    "timestamp": "2026-03-27",
    "gsPaperSlot": "General Studies"
  }
]
```

---

### 2. Auth Routes (`/auth`)

#### Request OTP
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "phone": "1234567890"
}
```

**Response:**
```json
{
  "message": "OTP sent successfully to your email",
  "email": "user@example.com"
}
```

#### Verify OTP
```http
POST /auth/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "message": "Login successful! You can now download your admit card.",
  "user": {
    "name": "John Doe",
    "email": "user@example.com"
  }
}
```

---

### 3. Admit Card Routes (`/admit`)

#### Download Admit Card
```http
GET /admit/download?email=user@example.com
```

**Response:** PDF file download

## 📊 Excel Format

Your Excel file should have these columns:

| Name | Phone Number | Email-id | Preferred Mode | City | Timestamp | GS Paper I Slot |
|------|--------------|----------|----------------|------|-----------|------------------|
| John Doe | 9876543210 | john@example.com | Offline | Delhi | 21/02/2026 22:31:31 | General Studies |

> **Note:** The system now automatically handles different column name variations and converts Excel serial dates to readable format!

## 🎯 Complete User Flow

1. **Admin** uploads Excel file with user data
2. Data is stored in **MongoDB**
3. **User** visits login page and enters email + phone
4. System sends **OTP** to user's email
5. User enters OTP to verify
6. User clicks **"Download Admit Card"**
7. System generates **dynamic PDF** with:
   - Name (from DB)
   - Mobile (from DB)
   - Venue (timestamp + preferredMode + city)
   - Paper I Subject (from GS Paper Slot column)
   - Paper II (CSAT - fixed)

## 🧪 Testing with Postman

### Test Excel Upload
1. Method: POST
2. URL: `http://localhost:5000/admin/upload`
3. Body → form-data → Key: `file`, Value: `[select excel file]`

### Test OTP Login
1. Method: POST
2. URL: `http://localhost:5000/auth/login`
3. Body (JSON):
```json
{
  "email": "test@example.com",
  "phone": "1234567890"
}
```

### Test Download Admit Card
1. Method: GET
2. URL: `http://localhost:5000/admit/download?email=test@example.com`
3. Click "Send & Download"

## ⚙️ Configuration Notes

### Gmail App Password Setup
1. Go to Google Account Settings
2. Security → 2-Step Verification
3. App passwords → Generate new password
4. Copy the 16-character password
5. Paste in `.env` file

**Note:** Now using SendGrid instead of Gmail SMTP for better deliverability!

### MongoDB Setup
```bash
# Local MongoDB
mongod --dbpath C:\data\db

# Or use MongoDB Atlas connection string
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/anubhuti-db
```

## 🚨 Troubleshooting

**Issue: Email not sending**
- Check SendGrid API key is correct
- Verify sender email in SendGrid dashboard
- Check SendGrid account status and limits
- Review error logs in console

**Issue: MongoDB connection error**
- Ensure MongoDB is running: `mongod`
- Check MONGO_URI in .env file
- Verify MongoDB port (default: 27017)

**Issue: PDF not downloading**
- Check browser popup blocker
- Verify Content-Disposition header in response

## 📝 Sample Excel Template

Create an Excel file with this structure:

```
Name,Phone Number,Email-id,Preferred Mode,City,Timestamp,GS Paper I Slot
Rahul Kumar,9876543210,rahul@example.com,Offline,Delhi,2026-03-27,History
Priya Singh,9876543211,priya@example.com,Online,Mumbai,2026-03-27,Geography
Amit Sharma,9876543212,amit@example.com,Offline,Bangalore,2026-03-27,Economics
```

## 🎨 Future Enhancements

- [ ] Add JWT authentication
- [ ] Admin dashboard with analytics
- [ ] Custom PDF templates with logos
- [ ] SMS OTP option
- [ ] Bulk email notifications
- [ ] Deploy to AWS/Render

## 📄 License

ISC

## 👨‍💻 Author

Built with ❤️ for Anubhuti II
