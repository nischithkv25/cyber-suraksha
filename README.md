# Cyber Suraksha 🛡️
### AI-Powered Cybersecurity Command Center & Emergency Intervention System

Welcome to **Cyber Suraksha**, a futuristic, cyberpunk-inspired command center platform designed to empower citizens with state-of-the-art cyber defense tools, real-time incident reporting, scam intelligence analysis, and emergency security interventions.

---

## 🚀 Key Features

### 1. Registration Phone Verification (Twilio SMS Gateway)
* **Production-Grade Verification:** During user registration, a 6-digit OTP code is generated and dispatched to the citizen's phone via **Twilio SMS Gateway**.
* **Secured Login Block:** New accounts are stored as unverified (`isVerified: false`). Login access is restricted until verification is completed successfully.
* **Smart Dev Fallback:** For local development and demonstrations, if a Twilio trial account blocks unverified numbers, the system prints the OTP to the console and writes it locally to **`backend/otp.txt`** for seamless code access.

### 2. Citizen Identity Dashboard & Profile Page
* **Digital Identity Badge:** A stunning glassmorphic ID card panel containing identity hash details, online indicator, verification status, and security clearance level.
* **Personal Details Management:** Form editor to manage personal details:
  * Full Name
  * Email Address
  * Primary Phone Number
  * Secondary Phone Number
  * Blood Group
  * City / Town
  * State
  * Residential Address
  * **Aadhaar Card (12-digit):** Secured with toggleable show/hide eye indicator and regex numeric validation.

### 3. AI Threat Scanner & Scam Analyzer
* Futuristic dashboard containing real-time threat scanners, image scanners, text scam analysis, and community incident reports.

---

## 🛠️ Technology Stack

* **Frontend:** Next.js 16 (App Router), TypeScript, TailwindCSS, Framer Motion (animations), Lucide Icons.
* **Backend:** Node.js, Express, TypeScript, Mongoose (MongoDB Atlas), Nodemon.
* **Services:** Twilio SMS Gateway.

---

## 📂 Project Structure

```
CYBER web/
├── backend/            # Node.js + Express backend service
│   ├── src/
│   │   ├── controllers/ # Request controllers (auth, AI, emergency)
│   │   ├── models/      # MongoDB Mongoose schemas (User, Complaint, Incident, Evidence)
│   │   ├── routes/      # REST API route directories
│   │   └── services/    # Twilio SMS, Socket.io, Blockchain hashes
│   └── .env            # Backend credentials
├── frontend/           # Next.js frontend application
│   ├── src/
│   │   ├── app/         # App router pages (dashboard, profile, login, register)
│   │   └── components/  # Layout elements (Navbar, AIChatbot)
│   └── .env            # Frontend public API endpoints
└── package.json        # Workspace package scripts
```

---

## ⚙️ Setup & Installation

### 1. Prerequisites
Ensure you have **Node.js** (v18+) and **NPM** installed.

### 2. Clone the Repository
```bash
git clone https://github.com/nischithkv/cyber-suraksha.git
cd cyber-suraksha
```

### 3. Install Dependencies
Install all package dependencies for the monorepo:
```bash
npm install
```

### 4. Configuration (Environment Variables)

Create a **`.env`** file in the `backend/` directory:
```env
PORT=5005
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxx.mongodb.net/cyber_suraksha
JWT_SECRET=your_super_secret_jwt_key

# Twilio SMS Configurations
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

Create a **`.env`** file in the `frontend/` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5005/api
```

---

## 🏃 Running the Application

To run both the **backend** and **frontend** concurrently in development mode, run:
```bash
npm run dev
```

* **Frontend Port:** `http://localhost:3000`
* **Backend Port:** `http://localhost:5005`

---

## 🔒 Security Practices (.gitignore)
Environment variables (`.env`) and local developer OTP records (`otp.txt`) are excluded from Git commits via the root `.gitignore` to prevent secret leaks on GitHub.

```bash
# To check Git status
git status

# To stage and commit your changes
git add .
git commit -m "feat: complete user authentication, twilio phone verification, and profile management"
```
