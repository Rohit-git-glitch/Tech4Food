import os
import sqlite3
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Optional, Dict, Any

from .base import BaseInventoryRepository
from .in_memory import (
    compute_status,
    DEFAULT_GUIDELINES,
    get_relative_iso_date,
)
from ..schemas.inventory import (
    FoodItemCreate,
    FoodItemUpdate,
    FoodItemResponse,
    StorageLocation,
    FoodCategory,
    FoodStatus,
)


def get_default_seed_records() -> List[Dict[str, Any]]:
    """Returns the 6 default initial food records with standard schema fields."""
    return [
        {
            "id": "food-001",
            "name": "Fresh Whole Milk",
            "category": "Dairy & Eggs",
            "quantity": 1.0,
            "unit": "L",
            "location": "Refrigerator",
            "date_added": get_relative_iso_date(-5),
            "estimated_shelf_life_days": 7,
            "estimated_expiry_date": get_relative_iso_date(2),
            "storage_guidance": "Keep refrigerated below 4°C. Consume within 7 days of opening.",
            "status": "Approaching Expiry",
            "notes": "Opened 5 days ago.",
        },
        {
            "id": "food-002",
            "name": "Organic Baby Spinach",
            "category": "Produce",
            "quantity": 250.0,
            "unit": "g",
            "location": "Pantry/Crisper",
            "date_added": get_relative_iso_date(-4),
            "estimated_shelf_life_days": 5,
            "estimated_expiry_date": get_relative_iso_date(1),
            "storage_guidance": "High humidity crisper drawer. Keep dry to prevent wilting.",
            "status": "Approaching Expiry",
            "notes": "Pre-washed.",
        },
        {
            "id": "food-003",
            "name": "Atlantic Salmon Fillet",
            "category": "Meat & Seafood",
            "quantity": 400.0,
            "unit": "g",
            "location": "Refrigerator",
            "date_added": get_relative_iso_date(-2),
            "estimated_shelf_life_days": 2,
            "estimated_expiry_date": get_relative_iso_date(0),
            "storage_guidance": "Store on lowest shelf. Cook or freeze immediately.",
            "status": "Requires Attention",
            "notes": "Raw fresh fish - use today or freeze.",
        },
        {
            "id": "food-004",
            "name": "Greek Yogurt (Plain)",
            "category": "Dairy & Eggs",
            "quantity": 500.0,
            "unit": "g",
            "location": "Refrigerator",
            "date_added": get_relative_iso_date(-2),
            "estimated_shelf_life_days": 10,
            "estimated_expiry_date": get_relative_iso_date(8),
            "storage_guidance": "Store on middle shelf. Keep lid tightly closed.",
            "status": "Fresh",
            "notes": "Unopened seal.",
        },
        {
            "id": "food-005",
            "name": "Free-Range Eggs",
            "category": "Dairy & Eggs",
            "quantity": 10.0,
            "unit": "items",
            "location": "Refrigerator",
            "date_added": get_relative_iso_date(-6),
            "estimated_shelf_life_days": 21,
            "estimated_expiry_date": get_relative_iso_date(15),
            "storage_guidance": "Keep in original carton on middle shelf.",
            "status": "Fresh",
            "notes": "Carton of 12 (2 used).",
        },
        {
            "id": "food-006",
            "name": "Chicken Breast Fillets",
            "category": "Meat & Seafood",
            "quantity": 2.0,
            "unit": "packs",
            "location": "Freezer",
            "date_added": get_relative_iso_date(-10),
            "estimated_shelf_life_days": 90,
            "estimated_expiry_date": get_relative_iso_date(80),
            "storage_guidance": "Deep frozen at -18°C. Thaw in refrigerator before cooking.",
            "status": "Fresh",
            "notes": "Vacuum packed.",
        },
    ]


class SqliteInventoryRepository(BaseInventoryRepository):
    """
    Persistent SQLite Inventory Repository for FoodGuard.
    
    Guarantees inventory persistence across application and server restarts.
    Uses parameterized SQL queries, WAL journal mode, and safely creates
    parent storage directories upon initialization.
    """

    def __init__(self, db_path: str, auto_seed: bool = True):
        self.db_path = str(db_path)
        self._ensure_storage_dir()
        self._init_schema(auto_seed=auto_seed)

    def _ensure_storage_dir(self) -> None:
        """Ensures the parent directory for the SQLite database file exists."""
        parent_dir = Path(self.db_path).resolve().parent
        parent_dir.mkdir(parents=True, exist_ok=True)

    def _get_connection(self) -> sqlite3.Connection:
        """Creates a SQLite connection configured with Row factory and pragmas."""
        conn = sqlite3.connect(self.db_path, timeout=15.0)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON;")
        return conn

    def _init_schema(self, auto_seed: bool = True) -> None:
        """Initializes database schema, indexes, and initial seed data if table is empty."""
        with self._get_connection() as conn:
            # WAL mode for enhanced concurrent read performance
            conn.execute("PRAGMA journal_mode = WAL;")

            conn.execute("""
                CREATE TABLE IF NOT EXISTS food_items (
                    id TEXT PRIMARY KEY NOT NULL,
                    name TEXT NOT NULL,
                    category TEXT NOT NULL,
                    quantity REAL NOT NULL,
                    unit TEXT NOT NULL,
                    location TEXT NOT NULL,
                    date_added TEXT NOT NULL,
                    estimated_shelf_life_days INTEGER NOT NULL,
                    estimated_expiry_date TEXT NOT NULL,
                    storage_guidance TEXT NOT NULL,
                    status TEXT NOT NULL,
                    notes TEXT
                );
            """)

            conn.execute("CREATE INDEX IF NOT EXISTS idx_food_items_location ON food_items(location);")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_food_items_category ON food_items(category);")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_food_items_status ON food_items(status);")

            if auto_seed:
                cursor = conn.execute("SELECT COUNT(*) as count FROM food_items;")
                count = cursor.fetchone()["count"]
                if count == 0:
                    self._seed_initial_records(conn)

    def _seed_initial_records(self, conn: sqlite3.Connection) -> None:
        """Inserts the 6 baseline seed records into a fresh empty database."""
        seeds = get_default_seed_records()
        insert_sql = """
            INSERT INTO food_items (
                id, name, category, quantity, unit, location,
                date_added, estimated_shelf_life_days, estimated_expiry_date,
                storage_guidance, status, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        params = [
            (
                s["id"],
                s["name"],
                s["category"],
                float(s["quantity"]),
                s["unit"],
                s["location"],
                s["date_added"],
                int(s["estimated_shelf_life_days"]),
                s["estimated_expiry_date"],
                s["storage_guidance"],
                s["status"],
                s.get("notes"),
            )
            for s in seeds
        ]
        conn.executemany(insert_sql, params)

    def _row_to_model(self, row: sqlite3.Row) -> FoodItemResponse:
        """Converts an SQLite row to a validated FoodItemResponse with dynamic shelf-life calculation."""
        current_status = compute_status(row["estimated_expiry_date"])
        return FoodItemResponse(
            id=row["id"],
            name=row["name"],
            category=row["category"],
            quantity=float(row["quantity"]),
            unit=row["unit"],
            location=row["location"],
            date_added=row["date_added"],
            estimated_shelf_life_days=int(row["estimated_shelf_life_days"]),
            estimated_expiry_date=row["estimated_expiry_date"],
            storage_guidance=row["storage_guidance"],
            status=current_status,
            notes=row["notes"] if row["notes"] is not None else None,
        )

    def get_all(
        self,
        location: Optional[StorageLocation] = None,
        category: Optional[FoodCategory] = None,
        status: Optional[FoodStatus] = None,
        search: Optional[str] = None,
    ) -> List[FoodItemResponse]:
        query = "SELECT * FROM food_items WHERE 1=1"
        params: List[Any] = []

        if location:
            query += " AND location = ?"
            params.append(location)

        if category:
            query += " AND category = ?"
            params.append(category)

        if search:
            term = f"%{search.strip().lower()}%"
            query += " AND (LOWER(name) LIKE ? OR LOWER(category) LIKE ? OR (notes IS NOT NULL AND LOWER(notes) LIKE ?))"
            params.extend([term, term, term])

        with self._get_connection() as conn:
            cursor = conn.execute(query, params)
            rows = cursor.fetchall()

        items = [self._row_to_model(row) for row in rows]

        # Filter by dynamically evaluated status if specified
        if status:
            items = [item for item in items if item.status == status]

        return items

    def get_by_id(self, item_id: str) -> Optional[FoodItemResponse]:
        with self._get_connection() as conn:
            cursor = conn.execute("SELECT * FROM food_items WHERE id = ?;", (item_id,))
            row = cursor.fetchone()
            if not row:
                return None
            return self._row_to_model(row)

    def create(self, item: FoodItemCreate) -> FoodItemResponse:
        item_id = f"food-{uuid.uuid4().hex[:8]}"
        now_iso = datetime.now(timezone.utc).isoformat()
        expiry_iso = get_relative_iso_date(item.estimated_shelf_life_days)
        guidance = item.storage_guidance or DEFAULT_GUIDELINES.get(item.category, "Store safely.")
        status_val = compute_status(expiry_iso)

        insert_sql = """
            INSERT INTO food_items (
                id, name, category, quantity, unit, location,
                date_added, estimated_shelf_life_days, estimated_expiry_date,
                storage_guidance, status, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        """
        params = (
            item_id,
            item.name.strip(),
            item.category,
            float(item.quantity),
            item.unit,
            item.location,
            now_iso,
            int(item.estimated_shelf_life_days),
            expiry_iso,
            guidance,
            status_val,
            item.notes,
        )

        with self._get_connection() as conn:
            conn.execute(insert_sql, params)

        return FoodItemResponse(
            id=item_id,
            name=item.name.strip(),
            category=item.category,
            quantity=item.quantity,
            unit=item.unit,
            location=item.location,
            date_added=now_iso,
            estimated_shelf_life_days=item.estimated_shelf_life_days,
            estimated_expiry_date=expiry_iso,
            storage_guidance=guidance,
            status=status_val,
            notes=item.notes,
        )

    def update(self, item_id: str, updates: FoodItemUpdate) -> Optional[FoodItemResponse]:
        existing = self.get_by_id(item_id)
        if not existing:
            return None

        data = existing.model_dump()
        update_dict = updates.model_dump(exclude_unset=True)

        for key, val in update_dict.items():
            if val is not None:
                data[key] = val

        if updates.estimated_shelf_life_days is not None:
            data["estimated_expiry_date"] = get_relative_iso_date(updates.estimated_shelf_life_days)
            data["status"] = compute_status(data["estimated_expiry_date"])

        update_sql = """
            UPDATE food_items SET
                name = ?,
                category = ?,
                quantity = ?,
                unit = ?,
                location = ?,
                estimated_shelf_life_days = ?,
                estimated_expiry_date = ?,
                storage_guidance = ?,
                status = ?,
                notes = ?
            WHERE id = ?;
        """
        params = (
            data["name"],
            data["category"],
            float(data["quantity"]),
            data["unit"],
            data["location"],
            int(data["estimated_shelf_life_days"]),
            data["estimated_expiry_date"],
            data["storage_guidance"],
            data["status"],
            data.get("notes"),
            item_id,
        )

        with self._get_connection() as conn:
            conn.execute(update_sql, params)

        return FoodItemResponse(**data)

    def delete(self, item_id: str) -> bool:
        with self._get_connection() as conn:
            cursor = conn.execute("DELETE FROM food_items WHERE id = ?;", (item_id,))
            return cursor.rowcount > 0

    def move_location(self, item_id: str, target_location: StorageLocation) -> Optional[FoodItemResponse]:
        existing = self.get_by_id(item_id)
        if not existing:
            return None

        with self._get_connection() as conn:
            conn.execute("UPDATE food_items SET location = ? WHERE id = ?;", (target_location, item_id))

        data = existing.model_dump()
        data["location"] = target_location
        return FoodItemResponse(**data)

    def is_connected(self) -> bool:
        try:
            with self._get_connection() as conn:
                conn.execute("SELECT 1;")
            return True
        except Exception:
            return False

    def get_provider_name(self) -> str:
        return "sqlite"

    def count(self) -> int:
        """Returns total number of items stored in database."""
        with self._get_connection() as conn:
            cursor = conn.execute("SELECT COUNT(*) as cnt FROM food_items;")
            return cursor.fetchone()["cnt"]

    def import_items(self, items: List[Dict[str, Any]], overwrite: bool = False) -> int:
        """
        Imports food items into SQLite.
        If overwrite=True, existing items with the same ID will be replaced.
        """
        insert_verb = "INSERT OR REPLACE" if overwrite else "INSERT OR IGNORE"
        sql = f"""
            {insert_verb} INTO food_items (
                id, name, category, quantity, unit, location,
                date_added, estimated_shelf_life_days, estimated_expiry_date,
                storage_guidance, status, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        """
        params = [
            (
                item["id"],
                item["name"],
                item["category"],
                float(item["quantity"]),
                item["unit"],
                item["location"],
                item.get("date_added") or item.get("dateAdded"),
                int(item.get("estimated_shelf_life_days") or item.get("estimatedShelfLifeDays", 7)),
                item.get("estimated_expiry_date") or item.get("estimatedExpiryDate"),
                item.get("storage_guidance") or item.get("storageGuidance", "Store safely."),
                item.get("status") or compute_status(item.get("estimated_expiry_date") or item.get("estimatedExpiryDate", "")),
                item.get("notes"),
            )
            for item in items
        ]
        with self._get_connection() as conn:
            cursor = conn.executemany(sql, params)
            return cursor.rowcount
