# 🎓 ScholarNavigator

<p align="center">

**AI-Powered Multi-Agent Scholarship Discovery & Application Assistant**

Built with **Google Agent Development Kit (ADK)**, **Google Gemini**, **FastAPI**, **React**, and **MongoDB Atlas**

</p>

---

## 🚀 Overview

ScholarNavigator is an intelligent multi-agent platform designed to simplify the scholarship application journey for students.

Instead of manually searching through hundreds of scholarship websites, students receive AI-powered scholarship recommendations, eligibility analysis, application guidance, document tracking, and deadline reminders through a collaborative multi-agent system.

The project demonstrates how Google ADK agents can work together to provide personalized educational assistance while ensuring security, transparency, and scalability.

---

# 🌟 Key Features

### 🎯 Smart Scholarship Discovery
- Personalized scholarship recommendations
- Intelligent search and filtering
- Match score calculation

### 🤖 AI Chat Assistant
- Powered by Google Gemini
- Context-aware conversations
- Personalized academic guidance

### 📊 Eligibility Analyzer
- Profile-based eligibility verification
- Scholarship matching
- AI-generated explanations

### 📅 Application Tracker
- Track scholarship applications
- Status management
- Deadline monitoring

### 📁 Document Vault
- Upload and organize documents
- Missing document detection
- Progress tracking

### 👤 Student Profile
- Personalized academic profile
- Dynamic AI recommendations

### 🔔 Notifications
- Deadline alerts
- AI reminders
- Scholarship updates

---

# 🧠 Multi-Agent Architecture

ScholarNavigator is built using the **Google Agent Development Kit (ADK)**.

The Router Agent receives every student request, determines the user's intent, retrieves the necessary context from MongoDB, and delegates tasks to specialized agents.

### Specialized Agents

- 🎓 Scholarship Recommendation Agent
- ✅ Eligibility Agent
- 📄 Document Agent
- 📋 Application Tracker Agent
- ⏰ Reminder Agent
- 👤 Profile Agent

Each agent focuses on a specific responsibility, improving modularity, scalability, and response quality.

---

# 🏗️ System Architecture

```text
Student
      │
      ▼
React Frontend
      │
      ▼
FastAPI Backend
      │
      ▼
Google ADK Router Agent
      │
      ├───────────── Scholarship Agent
      ├───────────── Eligibility Agent
      ├───────────── Document Agent
      ├───────────── Reminder Agent
      ├───────────── Tracker Agent
      └───────────── Profile Agent
                     │
                     ▼
            MongoDB Atlas
                     │
                     ▼
            Google Gemini API
                     │
                     ▼
           Personalized AI Response
```

---

# 📂 Project Structure

```text
ScholarNavigator/

├── app/
│   ├── agents/
│   ├── auth/
│   ├── database/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── agent.py
│   ├── mcp_server.py
│   └── fast_api_app.py
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── assets/
├── docs/
├── tests/
├── README.md
└── requirements.txt
```

---

# 💻 Technology Stack

## Frontend

- React
- TypeScript
- Tailwind CSS

## Backend

- FastAPI
- Python

## AI

- Google Gemini API
- Google Agent Development Kit (ADK)

## Database

- MongoDB Atlas

## Development

- Vite
- Git
- GitHub

---

# 🔒 Security Features

ScholarNavigator prioritizes student privacy and safe AI interactions.

- PII Detection & Redaction
- Prompt Injection Protection
- Academic Integrity Guard
- Human-in-the-Loop Verification
- Secure Environment Variables
- User Authentication
- MongoDB Data Isolation

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/Bhagyabonam/ScholarNavigator

cd ScholarNavigator
```

## Configure Environment

Create a `.env` file:

```env
GOOGLE_API_KEY=YOUR_API_KEY

MONGODB_URI=YOUR_MONGODB_URI

DATABASE_NAME=ScholarNavigator

GEMINI_MODEL=gemini-2.5-flash
```

## Install Backend

```bash
pip install -r requirements.txt
```

## Install Frontend

```bash
cd frontend

npm install
```

---

# ▶️ Run the Project

## Backend

```bash
uvicorn app.fast_api_app:app --reload
```

## Frontend

```bash
cd frontend

npm run dev
```

Visit:

```
http://localhost:5173
```

---

# 📸 Screenshots

Add screenshots of:

- Login Page
- Dashboard
- Scholarship Explorer
- AI Chat Assistant
- Eligibility Analyzer
- Application Tracker
- Document Vault

---

# 🎥 Demo Video

YouTube:

```
https://youtu.be/UlDpfQNTizI?si=MP_0aMf4Q6Oa8G0C
```

---

# 🧪 Example Queries

### Scholarship Recommendation

> Recommend scholarships for a Computer Science student with CGPA 8.8.

### Eligibility

> Am I eligible for Google Women Techmakers Scholarship?

### Deadlines

> What are my upcoming scholarship deadlines?

### Documents

> Which documents are still missing?

### Comparison

> Compare Google and Tata scholarships.

---

# 🌍 Real-World Impact

ScholarNavigator reduces the effort students spend searching for scholarships by providing:

- Personalized recommendations
- Intelligent eligibility analysis
- AI-powered guidance
- Deadline management
- Document organization

The platform helps students focus on securing educational opportunities instead of navigating fragmented information.

---

# 🚀 Future Enhancements

- Real-time scholarship APIs
- OCR Document Verification
- Resume Analysis
- SOP Review Assistant
- Calendar Integration
- Email Notifications
- Mobile Application
- Multi-language Support

---

# 👩‍💻 Developer

**Bonam Bhagya Sri Lakshmi**

B.Tech Computer Science Engineering (AI & ML)

---

# 📄 License

Licensed under the Apache License 2.0.
