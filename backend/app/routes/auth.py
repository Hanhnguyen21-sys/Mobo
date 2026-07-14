from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required

from app.extensions import db
from app.models import User

auth_bp = Blueprint("auth", __name__)


@auth_bp.post("/register")
def register():
    data = request.get_json() or {}

    username = (data.get("username") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not username or not email or not password:
        return jsonify({"message": "Username, email, and password are required."}), 400

    if len(password) < 8:
        return jsonify({"message": "Password must be at least 8 characters."}), 400

    existing_username = User.query.filter_by(username=username).first()
    if existing_username:
        return jsonify({"message": "Username is already taken."}), 409

    existing_email = User.query.filter_by(email=email).first()
    if existing_email:
        return jsonify({"message": "Email is already registered."}), 409

    user = User(username=username, email=email)
    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=str(user.id))

    return jsonify({
        "token": token,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "profile_image_url": user.profile_image_url,
            "created_at": user.created_at.isoformat(),
        }
    }), 201


@auth_bp.post("/login")
def login():
    data = request.get_json() or {}

    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"message": "Email and password are required."}), 400

    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return jsonify({"message": "Invalid email or password."}), 401

    token = create_access_token(identity=str(user.id))

    return jsonify({
        "token": token,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "profile_image_url": user.profile_image_url,
            "created_at": user.created_at.isoformat(),
        }
    })


@auth_bp.get("/me")
@jwt_required()
def me():
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)

    if not user:
        return jsonify({"message": "User not found."}), 404

    return jsonify({
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "profile_image_url": user.profile_image_url,
            "created_at": user.created_at.isoformat(),
        }
    })
    
    
@auth_bp.put("/me")
@jwt_required()
def update_me():
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)

    if not user:
        return jsonify({"message": "User not found."}), 404

    data = request.get_json() or {}

    username = (data.get("username") or "").strip()
    profile_image_url = (data.get("profile_image_url") or "").strip()

    if not username:
        return jsonify({"message": "Username is required."}), 400

    existing_username = User.query.filter(
        User.username == username,
        User.id != user.id,
    ).first()

    if existing_username:
        return jsonify({"message": "Username is already taken."}), 409

    user.username = username
    user.profile_image_url = profile_image_url or None

    db.session.commit()

    return jsonify({
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "profile_image_url": user.profile_image_url,
            "created_at": user.created_at.isoformat(),
        }
    })