def test_health_endpoint(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()

    assert data["status"] == "healthy"
    assert data["appName"] == "Tech4Food Smart Fridge API"
    assert data["apiVersion"] == "1.0.0"
    assert data["databaseConnected"] is True
    assert data["databaseProvider"] == "in-memory"
    assert "In-memory repository active" in data["databaseStatusMessage"]
    assert data["modules"]["inventory"] == "operational"
    assert "not_connected" in data["modules"]["telemetry"]
    assert "not_connected" in data["modules"]["alerts"]
    assert "not_connected" in data["modules"]["activities"]
    assert data["modules"]["geminiAi"] == "not_connected"
    assert data["modules"]["esp32Hardware"] == "not_connected"


def test_cors_options_preflight_localhost_5174(client):
    response = client.options(
        "/api/v1/inventory",
        headers={
            "Origin": "http://localhost:5174",
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "content-type",
        },
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:5174"
    assert "GET" in response.headers.get("access-control-allow-methods", "")


def test_cors_options_preflight_127_0_0_1_5174(client):
    response = client.options(
        "/api/v1/inventory",
        headers={
            "Origin": "http://127.0.0.1:5174",
            "Access-Control-Request-Method": "POST",
        },
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://127.0.0.1:5174"


def test_cors_get_headers_localhost_5174(client):
    response = client.get(
        "/api/v1/inventory",
        headers={"Origin": "http://localhost:5174"},
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:5174"
