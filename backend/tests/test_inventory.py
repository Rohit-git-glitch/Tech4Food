def test_list_inventory_returns_seeded_items(client):
    response = client.get("/api/v1/inventory")
    assert response.status_code == 200
    items = response.json()
    assert isinstance(items, list)
    assert len(items) >= 6

    # Verify camelCase serialization matches frontend models
    first_item = items[0]
    assert "id" in first_item
    assert "name" in first_item
    assert "category" in first_item
    assert "quantity" in first_item
    assert "unit" in first_item
    assert "location" in first_item
    assert "dateAdded" in first_item
    assert "estimatedShelfLifeDays" in first_item
    assert "estimatedExpiryDate" in first_item
    assert "storageGuidance" in first_item
    assert "status" in first_item


def test_filter_inventory_by_location(client):
    response = client.get("/api/v1/inventory?location=Freezer")
    assert response.status_code == 200
    items = response.json()
    assert len(items) >= 1
    assert all(i["location"] == "Freezer" for i in items)


def test_filter_inventory_by_category(client):
    response = client.get("/api/v1/inventory?category=Produce")
    assert response.status_code == 200
    items = response.json()
    assert len(items) >= 1
    assert all(i["category"] == "Produce" for i in items)


def test_search_inventory(client):
    response = client.get("/api/v1/inventory?search=Salmon")
    assert response.status_code == 200
    items = response.json()
    assert len(items) == 1
    assert "Salmon" in items[0]["name"]


def test_create_food_item_success(client):
    payload = {
        "name": "Fresh Strawberries",
        "category": "Produce",
        "quantity": 500.0,
        "unit": "g",
        "location": "Pantry/Crisper",
        "estimatedShelfLifeDays": 5,
        "storageGuidance": "Keep in crisper drawer.",
        "notes": "Purchased today",
    }
    response = client.post("/api/v1/inventory", json=payload)
    assert response.status_code == 201
    created = response.json()

    assert created["id"].startswith("food-")
    assert created["name"] == "Fresh Strawberries"
    assert created["category"] == "Produce"
    assert created["quantity"] == 500.0
    assert created["unit"] == "g"
    assert created["location"] == "Pantry/Crisper"
    assert created["estimatedShelfLifeDays"] == 5
    assert "estimatedExpiryDate" in created
    assert created["status"] in ["Fresh", "Approaching Expiry"]


def test_create_food_item_validation_error(client):
    # Invalid: empty name, negative quantity, invalid category
    payload = {
        "name": "",
        "category": "InvalidCategory",
        "quantity": -5.0,
        "unit": "g",
        "location": "Refrigerator",
        "estimatedShelfLifeDays": 0,
    }
    response = client.post("/api/v1/inventory", json=payload)
    assert response.status_code == 422


def test_get_food_item_by_id(client):
    # Existing item
    response = client.get("/api/v1/inventory/food-001")
    assert response.status_code == 200
    item = response.json()
    assert item["id"] == "food-001"
    assert item["name"] == "Fresh Whole Milk"

    # Non-existent item
    missing = client.get("/api/v1/inventory/non-existent-999")
    assert missing.status_code == 404
    assert "not found" in missing.json()["detail"]


def test_update_food_item(client):
    updates = {
        "name": "Organic Whole Milk (Low Fat)",
        "quantity": 2.0,
        "notes": "Updated volume",
    }
    response = client.put("/api/v1/inventory/food-001", json=updates)
    assert response.status_code == 200
    updated = response.json()
    assert updated["id"] == "food-001"
    assert updated["name"] == "Organic Whole Milk (Low Fat)"
    assert updated["quantity"] == 2.0
    assert updated["notes"] == "Updated volume"


def test_relocate_food_item(client):
    relocate_payload = {"targetLocation": "Freezer"}
    response = client.patch("/api/v1/inventory/food-001/location", json=relocate_payload)
    assert response.status_code == 200
    relocated = response.json()
    assert relocated["id"] == "food-001"
    assert relocated["location"] == "Freezer"


def test_delete_food_item(client):
    delete_response = client.delete("/api/v1/inventory/food-003?reason=cooked")
    assert delete_response.status_code == 200
    result = delete_response.json()
    assert result["success"] is True
    assert result["deletedId"] == "food-003"

    # Verify subsequent GET returns 404
    verify_response = client.get("/api/v1/inventory/food-003")
    assert verify_response.status_code == 404
