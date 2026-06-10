"""Integratietests voor de KIK-opvraag-flow."""


def test_health(client):
    assert client.get("/api/health").status_code == 200


def test_login_werkt(auth):
    assert "Authorization" in auth


def test_acht_profielen(client, auth):
    profs = client.get("/api/profielen", headers=auth).json()
    assert len(profs) == 8
    assert all("aantal_indicatoren" in p for p in profs)
    detail = client.get(f"/api/profielen/{profs[0]['key']}", headers=auth).json()
    assert len(detail["indicatoren"]) == profs[0]["aantal_indicatoren"]


def test_onbekend_profiel_404(client, auth):
    assert client.get("/api/profielen/bestaat-niet", headers=auth).status_code == 404


def test_zorgaanbieder_registratie_en_lijst(client, auth):
    # demo-aanbieders zijn geseed
    za = client.get("/api/zorgaanbieders", headers=auth).json()
    assert len(za) >= 3
    # publieke zelfregistratie (zonder token)
    r = client.post("/api/zorgaanbieders/register",
                    json={"naam": "Testaanbieder X", "plaats": "Zwolle"})
    assert r.status_code == 201, r.text
    # dubbele naam -> 400
    assert client.post("/api/zorgaanbieders/register",
                       json={"naam": "Testaanbieder X"}).status_code == 400


def test_uitvraag_flow_met_export(client, auth):
    profs = client.get("/api/profielen", headers=auth).json()
    key = profs[0]["key"]
    codes = [i["code"] for i in client.get(f"/api/profielen/{key}", headers=auth).json()["indicatoren"]]
    za = client.get("/api/zorgaanbieders", headers=auth).json()
    ids = [z["id"] for z in za[:2]]

    r = client.post("/api/uitvragen", headers=auth,
                    json={"profiel_key": key, "indicator_codes": codes, "zorgaanbieder_ids": ids})
    assert r.status_code == 201, r.text
    u = r.json()
    assert u["aantal_antwoorden"] == len(codes) * 2
    assert u["status"] in ("VOLTOOID", "GEDEELTELIJK", "MISLUKT")

    # detail
    det = client.get(f"/api/uitvragen/{u['id']}", headers=auth).json()
    assert len(det["antwoorden"]) == len(codes) * 2

    # exports
    csv_r = client.get(f"/api/uitvragen/{u['id']}/export.csv", headers=auth)
    assert csv_r.status_code == 200 and "Zorgaanbieder" in csv_r.text
    xlsx_r = client.get(f"/api/uitvragen/{u['id']}/export.xlsx", headers=auth)
    assert xlsx_r.status_code == 200 and len(xlsx_r.content) > 1000


def test_auth_handhaving(client):
    assert client.get("/api/uitvragen").status_code == 401


def test_ongeldige_indicator_422(client, auth):
    profs = client.get("/api/profielen", headers=auth).json()
    za = client.get("/api/zorgaanbieders", headers=auth).json()
    r = client.post("/api/uitvragen", headers=auth, json={
        "profiel_key": profs[0]["key"], "indicator_codes": ["BESTAAT_NIET"],
        "zorgaanbieder_ids": [za[0]["id"]]})
    assert r.status_code == 422
