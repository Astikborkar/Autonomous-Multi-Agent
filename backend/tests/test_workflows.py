import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.db.session import init_db
from app.db.seed import seed_data

@pytest_asyncio.fixture(autouse=True)
async def setup_test_db():
    await init_db()
    await seed_data()

@pytest.mark.asyncio
async def test_health_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

@pytest.mark.asyncio
async def test_list_templates():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/v1/templates")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) > 0

@pytest.mark.asyncio
async def test_metrics_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/v1/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "active_workflows" in data
    assert "success_rate" in data
