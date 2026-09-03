# Autonomous Multi-Agent Workflow Orchestrator (Full Stack AI SaaS)

An enterprise-grade, production-ready **Autonomous Multi-Agent Workflow Orchestration SaaS Platform** built with **Next.js 15, FastAPI, LangGraph, PostgreSQL, Redis, and Docker Compose**. 

Inspired by **LangGraph + Temporal + n8n + CrewAI**, the system empowers users to submit high-level objectives (e.g., *"Analyze customer feedback and generate an executive report"*). The platform automatically decomposes the goal into a Directed Acyclic Graph (DAG) of specialized AI agents, executes tasks in parallel, enforces exponential backoff retry policies, persists all state transitions, and streams live updates via Server-Sent Events (SSE) to a modern dark glassmorphic dashboard.

---

## Key Features

- **Multi-Agent DAG Architecture**:
  - **Planner Agent**: Interprets objectives and synthesizes topological execution DAGs with zero cyclic dependencies.
  - **Research Agent**: Scrapes, indexes, and summarizes primary context and data sources.
  - **Analyzer Agent**: Cleans data and computes quantitative KPIs (CSAT, NPS, throughput metrics).
  - **Validator Agent**: Verifies output schemas, anomaly scores, and triggers automatic retries if validation fails.
  - **Writer Agent**: Compiles executive Markdown reports, JSON metrics summaries, and PDF-ready deliverables.
- **Resilient Workflow Engine**:
  - Event-driven state machine (`PENDING`, `QUEUED`, `RUNNING`, `WAITING_APPROVAL`, `RETRYING`, `COMPLETED`, `FAILED`, `CANCELLED`).
  - Exponential backoff retry engine (`1s → 5s → 15s → 30s → 60s`).
  - Human-in-the-loop pause & approval node support.
- **Real-Time Telemetry & Observability**:
  - Redis Pub/Sub Server-Sent Events (SSE) continuous streaming (`/api/v1/events/{workflow_id}`).
  - Terminal-like live log viewer with agent filter pills, log levels, and search.
  - Interactive SVG/Canvas DAG Visualizer showing active node status rings and timers.
- **Enterprise Dark Glassmorphism UI**:
  - Next.js 15 App Router + Tailwind CSS + Lucide Icons + Recharts + Framer Motion.
  - Dashboard metrics cards, success rate trend charts, agent load graphs, and quick-start template gallery.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 15 (App Router), TypeScript, Tailwind CSS, Lucide React, React Query, Zustand, Recharts, Server-Sent Events (SSE) |
| **Backend** | FastAPI (Python 3.12), LangChain, LangGraph, Pydantic v2, AsyncIO, Pytest |
| **Database** | PostgreSQL (Production), SQLAlchemy 2.0 Async, Alembic migrations |
| **Queue & Events**| Redis Streams / PubSub, Celery / FastAPI Background Task Workers |
| **Infrastructure**| Docker, Docker Compose, Nginx Reverse Proxy |

---

## Project Folder Structure

```
.
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/ (auth, workflows, agents, events, templates, metrics)
│   │   ├── agents/ (base, planner, researcher, analyzer, validator, writer)
│   │   ├── core/ (config, security, redis)
│   │   ├── db/ (session, base, seed)
│   │   ├── models/ (user, workflow, workflow_step, agent_log, event, template)
│   │   ├── schemas/ (auth, workflow, agent, event, metrics)
│   │   └── services/ (orchestrator, retry_engine)
│   ├── tests/ (test_agents.py, test_workflows.py)
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── app/ (dashboard, workflows, builder, logs, templates)
│   ├── components/ (dashboard, workflow, logs, layout)
│   ├── hooks/ (useSSE.ts)
│   ├── lib/ (api-client.ts)
│   ├── store/ (useAuthStore.ts)
│   ├── types/ (workflow.ts, agent.ts)
│   ├── Dockerfile
│   └── package.json
├── nginx/
│   └── nginx.conf
├── docker-compose.yml
└── README.md
```

---

## Quick Start with Docker Compose

Run the entire full-stack ecosystem (PostgreSQL, Redis, FastAPI, Worker, Next.js, and Nginx) with a single command:

```bash
docker-compose up --build
```

Access the platform:
- **Dashboard UI**: [http://localhost](http://localhost) (or `http://localhost:3000`)
- **FastAPI OpenAPI Docs**: [http://localhost/api/v1/docs](http://localhost:8000/docs)
- **Health Check**: [http://localhost/health](http://localhost:8000/health)

---

## Local Standalone Setup (Without Docker)

### 1. Backend Setup

```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
$env:USE_SQLITE="true"  # Use SQLite for standalone testing without PostgreSQL
python -m app.db.seed
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Running Backend Unit & Integration Tests

```bash
cd backend
python -m pytest tests/test_agents.py tests/test_workflows.py
```

---

## Default Seed Credentials & Preset Templates

### Seed Users
- **Admin**: `admin@orchestrator.ai` / `admin123`
- **Developer**: `developer@orchestrator.ai` / `dev123`

### Preset Templates
1. **Executive Report Generator**: Synthesizes customer feedback into C-suite briefs.
2. **Market Intelligence & Competitor Audit**: Analyzes market positioning & product feature gaps.
3. **Software Vulnerability Audit**: Scans dependency graphs & microservices for OWASP Top 10 risks.
4. **Financial Performance Analyst**: Computes quarterly SaaS ARR/MRR metrics and payback periods.

---

## OpenAPI / Swagger Endpoints Summary

- `POST /api/v1/auth/login` — Authenticate and issue JWT access token
- `POST /api/v1/workflows` — Create new autonomous workflow
- `GET /api/v1/workflows` — List paginated workflows with status filter
- `GET /api/v1/workflows/{id}` — Get workflow state, DAG nodes, and report
- `POST /api/v1/workflows/{id}/execute` — Trigger execution via agent pool
- `POST /api/v1/workflows/{id}/retry` — Trigger step backoff retry
- `GET /api/v1/events/{workflow_id}` — Server-Sent Events (SSE) real-time stream
- `GET /api/v1/metrics` — Aggregate telemetry and system metrics
