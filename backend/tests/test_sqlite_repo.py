import os
import shutil
import tempfile
import pytest
from starlette.testclient import TestClient

from app.main import app
from app.repositories.sqlite import SqliteInventoryRepository
from app.repositories import get_inventory_repository
from app.schemas.inventory import (
    FoodItemCreate,
    FoodItemUpdate,
)


@pytest.fixture
def sqlite_test_db():
    """Provides an isolated SQLite database file path in a managed temp folder."""
    temp_dir = tempfile.mkdtemp(prefix="fg_test_")
    db_file = os.path.join(temp_dir, "test_inventory.db")
    yield db_file
    try:
        shutil.rmtree(temp_dir, ignore_errors=True)
    except Exception:
        pass


def test_sqlite_empty_initialization(sqlite_test_db):
    """Tests initializing SQLite repository without auto-seeding."""
    repo = SqliteInventoryRepository(sqlite_test_db, auto_seed=False)
    assert repo.count() == 0
    assert repo.get_all() == []
    assert repo.is_connected() is True
    assert repo.get_provider_name() == "sqlite"


def test_sqlite_auto_seed_and_no_duplicate_reseeding(sqlite_test_db):
    """Tests auto-seeding on empty database and verifies no duplicate reseeding on restart."""
    # First boot: empty database auto-seeds 6 items
    repo1 = SqliteInventoryRepository(sqlite_test_db, auto_seed=True)
    assert repo1.count() == 6
    items1 = repo1.get_all()
    assert len(items1) == 6
    ids1 = {i.id for i in items1}
    assert "food-001" in ids1
    assert "food-006" in ids1

    # Second boot: simulating application restart against the same database file
    repo2 = SqliteInventoryRepository(sqlite_test_db, auto_seed=True)
    assert repo2.count() == 6  # Does not reseed or double count
    items2 = repo2.get_all()
    assert len(items2) == 6


def test_sqlite_crud_operations(sqlite_test_db):
    """Tests create, read, update, move_location, and delete operations."""
    repo = SqliteInventoryRepository(sqlite_test_db, auto_seed=False)

    # 1. Create
    new_item_payload = FoodItemCreate(
        name="Artisan Sourdough Loaf",
        category="Bakery",
        quantity=1.0,
        unit="items",
        location="Pantry/Crisper",
        estimated_shelf_life_days=4,
        storage_guidance="Keep in cool bread box.",
        notes="Freshly baked",
    )
    created = repo.create(new_item_payload)
    assert created.id.startswith("food-")
    assert created.name == "Artisan Sourdough Loaf"
    assert created.category == "Bakery"
    assert created.quantity == 1.0
    assert created.unit == "items"
    assert created.location == "Pantry/Crisper"
    assert created.estimated_shelf_life_days == 4
    assert created.storage_guidance == "Keep in cool bread box."
    assert created.notes == "Freshly baked"
    assert created.status in ["Fresh", "Approaching Expiry"]

    # 2. Read by ID
    fetched = repo.get_by_id(created.id)
    assert fetched is not None
    assert fetched.id == created.id
    assert fetched.name == "Artisan Sourdough Loaf"

    # Non-existent ID returns None
    assert repo.get_by_id("non-existent-id") is None

    # 3. Update
    updated = repo.update(
        created.id,
        FoodItemUpdate(
            quantity=0.5,
            notes="Half consumed for breakfast",
        ),
    )
    assert updated is not None
    assert updated.quantity == 0.5
    assert updated.notes == "Half consumed for breakfast"
    assert updated.name == "Artisan Sourdough Loaf"

    # 4. Relocate / move_location
    moved = repo.move_location(created.id, "Freezer")
    assert moved is not None
    assert moved.location == "Freezer"

    # Verify state in DB
    refetched = repo.get_by_id(created.id)
    assert refetched.location == "Freezer"
    assert refetched.quantity == 0.5

    # 5. Delete
    delete_success = repo.delete(created.id)
    assert delete_success is True
    assert repo.get_by_id(created.id) is None
    assert repo.count() == 0

    # Deleting again returns False
    assert repo.delete(created.id) is False


def test_sqlite_filtering_and_search(sqlite_test_db):
    """Tests location, category, status filters and multi-field text search."""
    repo = SqliteInventoryRepository(sqlite_test_db, auto_seed=True)

    # Filter by location
    refrig_items = repo.get_all(location="Refrigerator")
    assert len(refrig_items) >= 1
    assert all(i.location == "Refrigerator" for i in refrig_items)

    freezer_items = repo.get_all(location="Freezer")
    assert len(freezer_items) >= 1
    assert all(i.location == "Freezer" for i in freezer_items)

    # Filter by category
    produce_items = repo.get_all(category="Produce")
    assert len(produce_items) >= 1
    assert all(i.category == "Produce" for i in produce_items)

    # Search by name
    spinach_items = repo.get_all(search="Spinach")
    assert len(spinach_items) == 1
    assert "Spinach" in spinach_items[0].name

    # Search by category
    meat_items = repo.get_all(search="Seafood")
    assert len(meat_items) >= 1

    # Search by notes
    washed_items = repo.get_all(search="Pre-washed")
    assert len(washed_items) == 1
    assert washed_items[0].id == "food-002"


def test_sqlite_persistence_across_restart(sqlite_test_db):
    """
    CRITICAL PERSISTENCE TEST:
    Creates an item, closes/discards the repository instance, instantiates a
    fresh repository against the same database file, and confirms the item still exists.
    """
    # Session 1: Create repository and add an item
    repo1 = SqliteInventoryRepository(sqlite_test_db, auto_seed=False)
    assert repo1.count() == 0

    created_item = repo1.create(
        FoodItemCreate(
            name="Honeycrisp Apples",
            category="Produce",
            quantity=4.0,
            unit="items",
            location="Pantry/Crisper",
            estimated_shelf_life_days=14,
            storage_guidance="Store in cool crisp zone.",
            notes="From Saturday local farmers market",
        )
    )
    item_id = created_item.id
    date_added = created_item.date_added
    expiry_date = created_item.estimated_expiry_date

    # Explicitly tear down Session 1 instance
    del repo1

    # Session 2: Simulating full backend restart
    repo2 = SqliteInventoryRepository(sqlite_test_db, auto_seed=False)
    assert repo2.count() == 1

    reloaded_item = repo2.get_by_id(item_id)
    assert reloaded_item is not None
    assert reloaded_item.id == item_id
    assert reloaded_item.name == "Honeycrisp Apples"
    assert reloaded_item.category == "Produce"
    assert reloaded_item.quantity == 4.0
    assert reloaded_item.unit == "items"
    assert reloaded_item.location == "Pantry/Crisper"
    assert reloaded_item.estimated_shelf_life_days == 14
    assert reloaded_item.date_added == date_added
    assert reloaded_item.estimated_expiry_date == expiry_date
    assert reloaded_item.storage_guidance == "Store in cool crisp zone."
    assert reloaded_item.notes == "From Saturday local farmers market"
    assert reloaded_item.status in ["Fresh", "Approaching Expiry"]

    # Mutate in Session 2
    repo2.move_location(item_id, "Refrigerator")
    del repo2

    # Session 3: Another restart, confirm mutated state persisted
    repo3 = SqliteInventoryRepository(sqlite_test_db, auto_seed=False)
    item_session_3 = repo3.get_by_id(item_id)
    assert item_session_3 is not None
    assert item_session_3.location == "Refrigerator"


def test_sqlite_import_items(sqlite_test_db):
    """Tests importing inventory records from raw dictionaries/backups."""
    repo = SqliteInventoryRepository(sqlite_test_db, auto_seed=False)
    test_records = [
        {
            "id": "food-custom-001",
            "name": "Almond Milk",
            "category": "Beverages",
            "quantity": 1.0,
            "unit": "L",
            "location": "Refrigerator",
            "dateAdded": "2026-10-20T10:00:00+00:00",
            "estimatedShelfLifeDays": 10,
            "estimatedExpiryDate": "2026-10-30T10:00:00+00:00",
            "storageGuidance": "Keep refrigerated.",
            "status": "Fresh",
            "notes": "Unsweetened",
        }
    ]
    count = repo.import_items(test_records)
    assert count == 1
    assert repo.count() == 1
    item = repo.get_by_id("food-custom-001")
    assert item is not None
    assert item.name == "Almond Milk"


def test_sqlite_with_fastapi_client(sqlite_test_db):
    """Tests full FastAPI API flow with SQLite repository dependency override."""
    sqlite_repo = SqliteInventoryRepository(sqlite_test_db, auto_seed=True)
    app.dependency_overrides[get_inventory_repository] = lambda: sqlite_repo

    with TestClient(app) as client:
        # Check health endpoint reports sqlite
        health_res = client.get("/api/v1/health")
        assert health_res.status_code == 200
        health_data = health_res.json()
        assert health_data["databaseProvider"] == "sqlite"
        assert health_data["databaseConnected"] is True

        # Check inventory list
        inv_res = client.get("/api/v1/inventory")
        assert inv_res.status_code == 200
        assert len(inv_res.json()) == 6

        # Check relocate PATCH
        patch_res = client.patch(
            "/api/v1/inventory/food-001/location",
            json={"targetLocation": "Freezer"},
        )
        assert patch_res.status_code == 200
        assert patch_res.json()["location"] == "Freezer"

    app.dependency_overrides.clear()
