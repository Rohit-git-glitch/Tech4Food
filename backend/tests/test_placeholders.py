def test_telemetry_placeholder_status(client):
    response = client.get("/api/v1/telemetry/status")
    assert response.status_code == 200
    data = response.json()
    assert data["module"] == "telemetry"
    assert data["status"] == "placeholder"
    assert data["connected"] is False


def test_alerts_placeholder_status(client):
    response = client.get("/api/v1/alerts/status")
    assert response.status_code == 200
    data = response.json()
    assert data["module"] == "alerts"
    assert data["status"] == "placeholder"
    assert data["connected"] is False


def test_activities_placeholder_status(client):
    response = client.get("/api/v1/activities/status")
    assert response.status_code == 200
    data = response.json()
    assert data["module"] == "activities"
    assert data["status"] == "placeholder"
    assert data["connected"] is False
