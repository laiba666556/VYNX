import os
import sys
import uuid

from fastapi.testclient import TestClient

# Add the root VYNX directory to the path so Python can find the 'backend' folder
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from backend.main import app
from backend.database import db

client = TestClient(app)


def _new_session() -> str:
    return str(uuid.uuid4())


def test_stats_empty_session_zeros():
    """A session with no scans returns zeroed stats."""
    response = client.get("/api/stats", params={"session_id": _new_session()})
    assert response.status_code == 200
    data = response.json()
    assert data["total_scans"] == 0
    assert data["safe_pct"] == 0.0
    assert data["last_scan_at"] is None
    assert data["threats_blocked"] == 0
    assert all(v == 0 for v in data["verdict_counts"].values())
    assert all(v == 0 for v in data["risk_level_counts"].values())


def test_stats_and_history_scoped_to_session():
    """History and stats only show rows belonging to the requested session."""
    session_a = _new_session()
    session_b = _new_session()

    db.save_scan("url", 10, "SAFE", "LOW", ["safe signal"], None, session_id=session_a)
    db.save_scan("message", 90, "PHISHING", "CRITICAL", ["blacklist"], None, session_id=session_b)

    history_a = client.get("/api/history", params={"session_id": session_a}).json()
    assert len(history_a) == 1
    assert history_a[0]["verdict"] == "SAFE"

    history_b = client.get("/api/history", params={"session_id": session_b}).json()
    assert len(history_b) == 1
    assert history_b[0]["verdict"] == "PHISHING"

    stats_a = client.get("/api/stats", params={"session_id": session_a}).json()
    assert stats_a["total_scans"] == 1
    assert stats_a["threats_blocked"] == 0
    assert stats_a["verdict_counts"]["SAFE"] == 1

    stats_b = client.get("/api/stats", params={"session_id": session_b}).json()
    assert stats_b["total_scans"] == 1
    assert stats_b["threats_blocked"] == 1
    assert stats_b["verdict_counts"]["PHISHING"] == 1


def test_history_without_session_returns_all():
    """Without session_id the endpoint keeps returning the global recent scans."""
    session_a = _new_session()
    db.save_scan("url", 10, "SAFE", "LOW", [], None, session_id=session_a)

    response = client.get("/api/history")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert any(entry["verdict"] == "SAFE" for entry in data)


def test_stats_without_session_global():
    """Without session_id stats aggregate every stored scan."""
    response = client.get("/api/stats")
    assert response.status_code == 200
    data = response.json()
    assert data["total_scans"] >= 2


def test_invalid_session_id_422():
    """Malformed session ids are rejected with 422 on both endpoints."""
    assert client.get("/api/history", params={"session_id": "not-a-uuid"}).status_code == 422
    assert client.get("/api/stats", params={"session_id": "not-a-uuid"}).status_code == 422
