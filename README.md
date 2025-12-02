# AI CRM Interaction Logger

**Full-stack CRM tool to log HCP (Healthcare Professional) interactions — either manually or via AI.**

---

## 🚀 What it does

- Log HCP interactions manually (structured form) or using AI-assisted chat summarization.  
- Automatically extract structured data (HCP name, materials, sentiment, samples, topics, follow-ups) using AI.  
- Store interactions in MySQL via FastAPI + SQLAlchemy.  
- View, edit, delete logged interactions in a clean UI.  
- Full CRUD + AI + Database + Frontend — a complete working app.

---

## 🛠 Tech Stack

| Layer        | Technology               |
|--------------|--------------------------|
| Backend      | Python, FastAPI, SQLAlchemy, MySQL |
| AI Agent     | :contentReference[oaicite:0]{index=0} (via Gemma / LLaMA), custom tools |
| Frontend     | React, Vite, Redux, Tailwind CSS |
| State / API  | Axios + Redux-Toolkit    |

---

## 🗂 Repo Structure

/ai-crm-backend/ ← Backend code (API, models, migrations, etc.)

/log-interaction-frontend/ ← Frontend (React + Redux)

.gitignore ← Ignore env, node_modules, venv, logs


---

## 📥 Setup & Run (Local)

### Backend
```bash
cd ai-crm-backend
# (Windows) activate venv
venv\\Scripts\\activate

# Install dependencies (if not yet)
pip install -r requirements.txt

# Run server
uvicorn app.main:app --reload --port 8000
```
### Frontend
```
cd log-interaction-frontend
npm install   # if dependencies missing
npm run dev
```
Frontend → http://localhost:5173

Backend (API docs) → http://localhost:8000/docs

## ✨ Features
✅ Manual form to log interactions

✅ AI-assisted “Chat → Log” mode (useful for quick logging)

✅ Automatic extraction: HCP name, sentiment, materials, samples, follow-ups

✅ List of recent interactions with edit & delete

✅ Full CRUD + live sync between database & UI

✅ Clean, user-friendly UI

## 🔧 Environment Variables
Create a .env file in backend root (ai-crm-backend):


GROQ_API_KEY=your_groq_api_key_here

DATABASE_URL=[mysql+pymysql://user:password@localhost/dbname](http://localhost/phpmyadmin/index.php?route=/sql&pos=0&db=ai_crm&table=interactions)

DB_USER=root

DB_PASSWORD=

DB_HOST=localhost

DB_PORT=3306

DB_NAME=ai_crm

Frontend uses .env for API base:


VITE_API_BASE=http://localhost:8000

## 🧪 Demo Usage

Start backend & frontend

Use the AI Assistant (right side) or manual form (left) to log a meeting

View interaction in list below — edit or delete as needed

Use backend API docs (via Swagger) to view endpoints or test manually

## ✅ Why This Project Stands Out

Complete “real-life” CRM flow: interactions → AI summary → DB → frontend display

Demonstrates full-stack capabilities (Python → React → DB → AI)

Clean code, modular architecture, easy to run & extend

Good demonstration of AI + CRUD integration

## 📄 License & Credits

Open-source. Use freely.

Project developed by @nameisrahul
