import pytest
from starlette.testclient import TestClient
from app.main import app
from app.repositories import get_inventory_repository, InMemoryInventoryRepository


@pytest.fixture(scope="function")
def test_repo():
    """Provides a fresh isolated in-memory repository for each test."""
    repo = InMemoryInventoryRepository()
    return repo


@pytest.fixture(scope="function")
def client(test_repo):
    """Provides a TestClient with the isolated repository dependency override."""
    app.dependency_overrides[get_inventory_repository] = lambda: test_repo
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
