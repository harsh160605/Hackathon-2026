# 🚀 Smart Resource Allocation System for Volunteer Coordination

A data-driven platform that intelligently connects volunteers with community needs using skill-based matching, urgency prioritization, and real-time data analysis.

## 🏗️ Architecture

```
Frontend (React + Tailwind CSS)  →  Backend (Node.js + Express)  →  Database (MongoDB)
                                           ↓
                                    AI Module (Python FastAPI)
```

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Python 3.9+ (optional, for AI service)

### 1. Backend
```bash
cd server
npm install
# Edit .env with your MongoDB URI
npm run seed    # Seed database with demo data
npm run dev     # Start backend on port 5000
```

### 2. Frontend
```bash
cd client
npm install
npm run dev     # Start frontend on port 5173
```

### 3. AI Service (Optional)
```bash
cd ai-service
pip install -r requirements.txt
python app.py   # Start on port 8000
```

### 🔑 Demo Credentials (after seeding)
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@volunteer.com | password123 |
| NGO | ngo1@volunteer.com | password123 |
| Volunteer | volunteer1@volunteer.com | password123 |

## 🔥 Features

- **Intelligent Matching** — Skill-based, location-aware, availability-weighted
- **Priority Detection** — Urgency scoring with deadline & age analysis
- **Role-based Dashboards** — Volunteer, NGO, Admin
- **Map Visualization** — Leaflet-powered task/volunteer maps
- **AI Chatbot** — Rule-based assistant for navigation & FAQ
- **Analytics** — Charts, stats, skill demand analysis

## 🤖 Matching Algorithm

```
Composite Score = 0.5 × Skill Match + 0.3 × Location Proximity + 0.2 × Availability
```

- **Skill Match**: Jaccard similarity between volunteer skills and task requirements
- **Location**: Haversine distance (closer = higher score, 100km radius)
- **Availability**: Full-time (1.0) > Part-time (0.7) > Weekends (0.4)

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Tailwind CSS 4, Recharts, Leaflet |
| Backend | Node.js, Express 5, Mongoose |
| Database | MongoDB |
| AI | Python, FastAPI, scikit-learn |
| Auth | JWT, bcrypt |

## 📁 Project Structure

```
├── client/           # React frontend
├── server/           # Node.js backend
│   ├── models/       # Mongoose schemas
│   ├── routes/       # API endpoints
│   ├── services/     # Matching engine, priority scorer
│   └── middleware/    # Auth, role check
├── ai-service/       # Python ML micro-service
└── README.md
```

## 👥 Team

Built for Hackathon 2k26
