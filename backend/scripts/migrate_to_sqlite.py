"""
Tech4Food Smart Fridge — Inventory Migration & Backup Utility

Usage:
    python backend/scripts/migrate_to_sqlite.py [--export-live] [--import-backup] [--status]

Examples:
    # Check status of SQLite database:
    python backend/scripts/migrate_to_sqlite.py --status

    # Backup currently running backend inventory to JSON:
    python backend/scripts/migrate_to_sqlite.py --export-live

    # Import items from backup JSON into SQLite (skips existing):
    python backend/scripts/migrate_to_sqlite.py --import-backup
"""

import argparse
import json
import os
import sys
from pathlib import Path

# Add backend directory to sys.path so app modules are resolvable
BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))

from app.config import get_settings
from app.repositories.sqlite import SqliteInventoryRepository, get_default_seed_records


def get_backup_path() -> Path:
    settings = get_settings()
    data_dir = Path(settings.resolved_sqlite_db_path).parent
    data_dir.mkdir(parents=True, exist_ok=True)
    return data_dir / "inventory_backup.json"


def export_live_inventory(port: int = 8001) -> bool:
    """Exports inventory from running FastAPI server to backup JSON."""
    import urllib.request
    import urllib.error

    url = f"http://127.0.0.1:{port}/api/v1/inventory"
    print(f"Connecting to running backend at {url}...")

    try:
        req = urllib.request.Request(url, headers={"Accept": "application/json"})
        with urllib.request.urlopen(req, timeout=5) as response:
            if response.status == 200:
                data = json.loads(response.read().decode("utf-8"))
                backup_path = get_backup_path()
                with open(backup_path, "w", encoding="utf-8") as f:
                    json.dump(data, f, indent=2)
                print(f"[SUCCESS] Exported {len(data)} items to {backup_path}")
                return True
    except urllib.error.URLError as e:
        print(f"[NOTICE] Could not connect to port {port} ({e}). Checking port 8000...")
        if port != 8000:
            return export_live_inventory(port=8000)
    except Exception as e:
        print(f"[ERROR] Failed to export live inventory: {e}")
    return False


def import_backup_to_sqlite(overwrite: bool = False) -> int:
    """Imports records from inventory_backup.json into SQLite."""
    settings = get_settings()
    repo = SqliteInventoryRepository(settings.resolved_sqlite_db_path, auto_seed=False)
    backup_path = get_backup_path()

    if not backup_path.exists():
        print(f"[WARN] No backup file found at {backup_path}. Seeding default records instead...")
        seeds = get_default_seed_records()
        count = repo.import_items(seeds, overwrite=overwrite)
        print(f"[SUCCESS] Seeded {count} items into SQLite database.")
        return count

    with open(backup_path, "r", encoding="utf-8") as f:
        records = json.load(f)

    count = repo.import_items(records, overwrite=overwrite)
    print(f"[SUCCESS] Imported/synced {count} records into {settings.resolved_sqlite_db_path}")
    print(f"Total inventory items now in SQLite: {repo.count()}")
    return count


def print_status() -> None:
    settings = get_settings()
    db_path = Path(settings.resolved_sqlite_db_path)
    print("=" * 60)
    print("FoodGuard SQLite Storage Status")
    print("=" * 60)
    print(f"Configured SQLite Path: {settings.sqlite_db_path}")
    print(f"Resolved Absolute Path: {db_path}")
    print(f"Database file exists:   {db_path.exists()}")

    if db_path.exists():
        repo = SqliteInventoryRepository(str(db_path), auto_seed=False)
        count = repo.count()
        connected = repo.is_connected()
        print(f"Connection state:       {'CONNECTED' if connected else 'DISCONNECTED'}")
        print(f"Total stored items:     {count}")
        items = repo.get_all()
        for idx, item in enumerate(items, 1):
            print(f"  {idx}. [{item.id}] {item.name} ({item.category}) - {item.quantity} {item.unit} in {item.location} [{item.status}]")
    else:
        print("Database not yet created. It will initialize automatically on next backend start.")

    backup_path = get_backup_path()
    print(f"Backup file exists:     {backup_path.exists()} ({backup_path})")
    print("=" * 60)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="FoodGuard Inventory SQLite Migration Tool")
    parser.add_argument("--export-live", action="store_true", help="Export live inventory from running server")
    parser.add_argument("--import-backup", action="store_true", help="Import items from backup JSON into SQLite")
    parser.add_argument("--status", action="store_true", help="Show current SQLite database and item count")
    parser.add_argument("--overwrite", action="store_true", help="Overwrite existing items with same ID on import")

    args = parser.parse_args()

    if args.export_live:
        export_live_inventory()
    elif args.import_backup:
        import_backup_to_sqlite(overwrite=args.overwrite)
    else:
        print_status()
