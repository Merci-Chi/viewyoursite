"""Backend tests for Studio website builder - share endpoints and source-zip."""
import os
import io
import zipfile
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://bold-chatterjee-6.preview.emergentagent.com').rstrip('/')
API = f"{BASE_URL}/api"


def test_root():
    r = requests.get(f"{API}/", timeout=30)
    assert r.status_code == 200
    assert r.json().get("message") == "ok"


def test_share_create_and_get():
    site_payload = {
        "name": "TEST_Site",
        "pages": [{"id": "p1", "elements": [{"id": "e1", "type": "text", "text": "Hello"}]}],
        "header": {"elements": []},
        "footer": {"elements": []},
    }
    r = requests.post(f"{API}/share", json={"site": site_payload}, timeout=30)
    assert r.status_code == 200, r.text
    body = r.json()
    assert "id" in body and isinstance(body["id"], str) and len(body["id"]) > 0
    sid = body["id"]

    # GET back
    g = requests.get(f"{API}/share/{sid}", timeout=30)
    assert g.status_code == 200
    data = g.json()
    assert data["id"] == sid
    assert data["site"]["name"] == "TEST_Site"
    assert "_id" not in data


def test_share_get_404():
    r = requests.get(f"{API}/share/nonexistent_xyz", timeout=30)
    assert r.status_code == 404


def test_source_zip():
    r = requests.get(f"{API}/source-zip", timeout=120)
    assert r.status_code == 200
    assert r.headers.get("content-type", "").startswith("application/zip")
    # verify it's a valid zip
    z = zipfile.ZipFile(io.BytesIO(r.content))
    names = z.namelist()
    assert any(n.endswith("backend/server.py") for n in names)
    # ensure excludes worked
    assert not any("node_modules" in n for n in names)
    assert not any("__pycache__" in n for n in names)
