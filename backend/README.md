# Tech4Food Smart Fridge — Backend API (Stage 1)

This is the Python FastAPI backend service for the **Tech4Food Smart Fridge** inventory management and food safety monitoring system.

In **Stage 1**, this service provides:
- Fully validated RESTful CRUD endpoints for food inventory (`/api/v1/inventory`).
- System health and connectivity diagnostics (`/api/v1/health`).
- An in-memory repository pre-seeded with sample data compatible with the React frontend.
- Gemini text parsing and food-package image detection endpoints.
- Automated tests verifying all endpoints and error response codes.

---

## Prerequisites

- **Python**: Version 3.10+ (tested on Python 3.14)
- **Package Manager**: `pip`

---

## Directory Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── config.py              # Pydantic Settings & environment loader
│   ├── main.py                # FastAPI entrypoint, CORS & router registry
│   ├── schemas/               # Pydantic models (with camelCase alias generation)
│   │   ├── common.py          # CamelModel base
│   │   ├── health.py          # Health check & module status schemas
│   │   ├── inventory.py       # Food item CRUD schemas & validators
│   │   ├── telemetry.py       # Sensor telemetry schemas
│   │   ├── alerts.py          # Safety alert schemas
│   │   └── activities.py      # Activity event schemas
│   ├── repositories/          # Data access abstraction
│   │   ├── base.py            # Abstract BaseInventoryRepository
│   │   └── in_memory.py       # Thread-safe in-memory repository (Stage 1)
│   ├── services/              # Business logic layer
│   │   └── inventory_service.py
│   └── routers/               # FastAPI API route handlers
│       ├── health.py          # GET /api/v1/health
│       ├── inventory.py       # Full CRUD /api/v1/inventory
│       ├── telemetry.py       # /api/v1/telemetry (placeholder contract)
│       ├── alerts.py          # /api/v1/alerts (placeholder contract)
│       └── activities.py      # /api/v1/activities (placeholder contract)
├── tests/
│   ├── conftest.py            # Pytest test client & dependency override fixture
│   ├── test_health.py         # Health endpoint tests
│   ├── test_inventory.py      # Inventory CRUD, search, filter & validation tests
│   └── test_placeholders.py   # Placeholder module status tests
├── .env.example               # Template environment configuration
├── .env                       # Local environment configuration (git-ignored)
├── requirements.txt           # Python package dependencies
└── README.md                  # This documentation
```

### Gemini AI endpoints

Configure `GEMINI_API_KEY` and `GEMINI_MODEL` in `backend/.env`, then use:

- `POST /api/v1/ai/voice-parse` with JSON `{ "transcript": "..." }`
- `POST /api/v1/ai/image-detect` with multipart `image` and optional `transcript`

---

## Setup & Installation

### 1. Navigate to the backend directory
```powershell
cd backend
```

### 2. Create and Activate Virtual Environment

**Windows (PowerShell):**
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

**Windows (Command Prompt):**
```cmd
python -m venv .venv
.\.venv\Scripts\activate.bat
```

**Linux / macOS:**
```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Install Dependencies
```powershell
pip install -r requirements.txt
```

### 4. Configure Environment Variables
Copy `.env.example` to `.env`:
```powershell
cp .env.example .env
```
Default local settings in `.env`:
```ini
ENVIRONMENT=development
API_PREFIX=/api/v1
HOST=127.0.0.1
PORT=8000
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
USE_IN_MEMORY_REPO=true
SUPABASE_URL=
SUPABASE_KEY=
```

---

## Running the API Server

Start the server using `uvicorn`:
```powershell
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Once running:
- **Interactive OpenAPI Documentation (Swagger UI)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Alternative ReDoc Documentation**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **Health Check Endpoint**: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)

---

## Running Automated Tests

Run the full automated test suite using `pytest`:
```powershell
pytest tests -v
```

Expected output:
```
backend/tests/test_health.py::test_health_endpoint PASSED
backend/tests/test_inventory.py::test_list_inventory_returns_seeded_items PASSED
backend/tests/test_inventory.py::test_filter_inventory_by_location PASSED
backend/tests/test_inventory.py::test_filter_inventory_by_category PASSED
backend/tests/test_inventory.py::test_search_inventory PASSED
backend/tests/test_inventory.py::test_create_food_item_success PASSED
backend/tests/test_inventory.py::test_create_food_item_validation_error PASSED
backend/tests/test_inventory.py::test_get_food_item_by_id PASSED
backend/tests/test_inventory.py::test_update_food_item PASSED
backend/tests/test_inventory.py::test_relocate_food_item PASSED
backend/tests/test_inventory.py::test_delete_food_item PASSED
backend/tests/test_placeholders.py::test_telemetry_placeholder_status PASSED
backend/tests/test_placeholders.py::test_alerts_placeholder_status PASSED
backend/tests/test_placeholders.py::test_activities_placeholder_status PASSED
======================== 14 passed in 0.37s ========================
```

---

## API Endpoints Reference

### Health & System Status
| Method | Endpoint | Description | Status Code |
|---|---|---|---|
| `GET` | `/api/v1/health` | System health, database connection state & module status | `200 OK` |

### Food Inventory
| Method | Endpoint | Query Parameters | Description | Status Code |
|---|---|---|---|---|
| `GET` | `/api/v1/inventory` | `location`, `category`, `status`, `search` | List inventory items with optional filters | `200 OK` |
| `POST` | `/api/v1/inventory` | — | Log a new food record with automatic shelf-life calculation | `201 Created` |
| `GET` | `/api/v1/inventory/{id}` | — | Get single food record by ID | `200 OK` / `404` |
| `PUT` | `/api/v1/inventory/{id}` | — | Update existing food record details | `200 OK` / `404` |
| `PATCH` | `/api/v1/inventory/{id}/location` | — | Relocate food item to another zone | `200 OK` / `404` |
| `DELETE` | `/api/v1/inventory/{id}` | `reason` | Remove food record from smart fridge | `200 OK` / `404` |

### Placeholder Contracts (Stage 2 Preparation)
| Method | Endpoint | Description | Status Code |
|---|---|---|---|
| `GET` | `/api/v1/telemetry/status` | Reports telemetry service status (`not_connected`) | `200 OK` |
| `GET` | `/api/v1/alerts/status` | Reports alerts service status (`not_connected`) | `200 OK` |
| `GET` | `/api/v1/activities/status` | Reports audit logging status (`not_connected`) | `200 OK` |

---

## Transition to Supabase (Stage 2)

The repository pattern allows switching to Supabase PostgreSQL without modifying FastAPI routers:
1. Provide `SUPABASE_URL` and `SUPABASE_KEY` in `.env`.
2. Set `USE_IN_MEMORY_REPO=false`.
3. In `backend/app/repositories/`, implement `SupabaseInventoryRepository(BaseInventoryRepository)` targeting the `food_inventory` table.
