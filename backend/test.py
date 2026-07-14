import json
import time
import urllib.error
import urllib.request


BASE_URL = "http://localhost:5000/api"


def request(method, path, data=None, token=None):
    body = None
    headers = {"Content-Type": "application/json"}

    if data is not None:
        body = json.dumps(data).encode("utf-8")

    if token:
        headers["Authorization"] = f"Bearer {token}"

    req = urllib.request.Request(
        f"{BASE_URL}{path}",
        data=body,
        headers=headers,
        method=method,
    )

    try:
        with urllib.request.urlopen(req) as response:
            response_body = response.read().decode("utf-8")
            return response.status, json.loads(response_body)
    except urllib.error.HTTPError as error:
        response_body = error.read().decode("utf-8")
        try:
            parsed = json.loads(response_body)
        except json.JSONDecodeError:
            parsed = {"message": response_body}
        return error.code, parsed


def assert_status(actual, expected, label):
    if actual != expected:
        raise AssertionError(f"{label} failed. Expected {expected}, got {actual}.")


def main():
    unique = int(time.time())
    username = f"mobo_test_{unique}"
    email = f"mobo_test_{unique}@example.com"
    password = "password123"

    print("1. Health check")
    status, body = request("GET", "/health")
    assert_status(status, 200, "Health check")
    print(body)

    print("\n2. Register")
    status, body = request(
        "POST",
        "/auth/register",
        {"username": username, "email": email, "password": password},
    )
    assert_status(status, 201, "Register")
    token = body["token"]
    print({"user": body["user"], "token_created": bool(token)})

    print("\n3. Login")
    status, body = request("POST", "/auth/login", {"email": email, "password": password})
    assert_status(status, 200, "Login")
    token = body["token"]
    print({"user": body["user"], "token_created": bool(token)})

    print("\n4. /auth/me")
    status, body = request("GET", "/auth/me", token=token)
    assert_status(status, 200, "Current user")
    print(body)

    print("\n5. Get plant catalog")
    status, body = request("GET", "/plants", token=token)
    assert_status(status, 200, "Get plants")
    plants = body["plants"]
    if not plants:
        raise AssertionError("No plants found. Run: flask --app run.py seed")
    plant_type_id = plants[0]["id"]
    print({"plant_count": len(plants), "chosen_plant": plants[0]})

    print("\n6. Choose plant")
    status, body = request(
        "POST",
        "/user-plants",
        {"plant_type_id": plant_type_id, "nickname": "Sunny"},
        token=token,
    )
    assert_status(status, 201, "Choose plant")
    print(body)

    print("\n7. Get emotions")
    status, body = request("GET", "/emotions", token=token)
    assert_status(status, 200, "Get emotions")
    emotions = body["emotions"]
    if not emotions:
        raise AssertionError("No emotions found. Run: flask --app run.py seed")
    emotion_id = emotions[0]["id"]
    print({"emotion_count": len(emotions), "chosen_emotion": emotions[0]})

    print("\n8. Create reflection")
    status, body = request(
        "POST",
        "/posts",
        {
            "content": "Today I noticed one small good thing and wrote it down.",
            "emotion_id": emotion_id,
            "visibility": "private",
        },
        token=token,
    )
    assert_status(status, 201, "Create reflection")
    print(body)

    print("\n9. Check current plant")
    status, body = request("GET", "/user-plants/current", token=token)
    assert_status(status, 200, "Current plant")
    plant = body["plant"]
    if plant["total_points"] <= 0:
        raise AssertionError("Plant points did not increase after reflection.")
    print(body)

    print("\n10. Get my posts")
    status, body = request("GET", "/posts/me", token=token)
    assert_status(status, 200, "Get my posts")
    if not body["posts"]:
        raise AssertionError("Post was not saved.")
    print({"post_count": len(body["posts"]), "latest_post": body["posts"][0]})

    print("\n11. Get rewards")
    status, body = request("GET", "/rewards", token=token)
    assert_status(status, 200, "Get rewards")
    print({"reward_count": len(body["rewards"])})

    print("\n12. Get my rewards")
    status, body = request("GET", "/rewards/me", token=token)
    assert_status(status, 200, "Get my rewards")
    print(body)

    print("\nBackend MVP flow passed.")


if __name__ == "__main__":
    main()
