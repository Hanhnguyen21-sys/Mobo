from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.extensions import db
from app.models import PlantType, UserPlant

plants_bp = Blueprint("plants", __name__)

def serialize_user_plant(user_plant):
    plant_type = user_plant.plant_type

    return {
        "id": user_plant.id,
        "nickname": user_plant.nickname,
        "total_points": user_plant.total_points,
        "growth_stage": user_plant.growth_stage,
        "is_current": user_plant.is_current,
        "planted_at": user_plant.planted_at.isoformat(),
        "last_activity_at": user_plant.last_activity_at.isoformat()
        if user_plant.last_activity_at
        else None,
        "plant_type": {
            "id": plant_type.id,
            "name": plant_type.name,
            "description": plant_type.description,
            "image_url": plant_type.image_url,
            "emoji": plant_type.emoji,
            "required_points": plant_type.required_points,
        },
    }
@plants_bp.get("/plants")
@jwt_required()
def get_plants():
    plants = PlantType.query.order_by(PlantType.name.asc()).all()

    return jsonify({
        "plants": [
            {
                "id": plant.id,
                "name": plant.name,
                "description": plant.description,
                "image_url": plant.image_url,
                "emoji": plant.emoji,
                "required_points": plant.required_points,
            }
            for plant in plants
        ]
    })


@plants_bp.post("/user-plants")
@jwt_required()
def create_user_plant():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    plant_type_id = data.get("plant_type_id")
    nickname = (data.get("nickname") or "").strip()

    if not plant_type_id:
        return jsonify({"message": "plant_type_id is required."}), 400

    plant_type = db.session.get(PlantType, plant_type_id)

    if not plant_type:
        return jsonify({"message": "Plant type not found."}), 404
    existing_user_plant = UserPlant.query.filter_by(
        user_id=user_id,
        plant_type_id=plant_type.id,
    ).first()
    
    if existing_user_plant:
        return jsonify({"message": "You already have this plant."}), 409
    
    
    has_existing_plant = UserPlant.query.filter_by(user_id=user_id).first()
    user_plant = UserPlant(
        user_id=user_id,
        plant_type_id=plant_type.id,
        nickname=nickname or plant_type.name,
        total_points=0,
        growth_stage="Seed",
        is_current=not bool(has_existing_plant),
    )

    db.session.add(user_plant)
    db.session.commit()

    return jsonify({
        "plant": {
            "id": user_plant.id,
            "nickname": user_plant.nickname,
            "total_points": user_plant.total_points,
            "growth_stage": user_plant.growth_stage,
            "planted_at": user_plant.planted_at.isoformat(),
            "last_activity_at": user_plant.last_activity_at.isoformat()
            if user_plant.last_activity_at
            else None,
            "plant_type": {
                "id": plant_type.id,
                "name": plant_type.name,
                "description": plant_type.description,
                "image_url": plant_type.image_url,
                "emoji": plant_type.emoji,
                "required_points": plant_type.required_points,
            },
        }
    }), 201
    
# return current plant

@plants_bp.get("/user-plants/current")
@jwt_required()
def get_current_user_plant():
    user_id = int(get_jwt_identity())

    user_plant = UserPlant.query.filter_by(
        user_id=user_id,
        is_current=True,
    ).first()

    if not user_plant:
        user_plant = (
            UserPlant.query
            .filter_by(user_id=user_id)
            .order_by(UserPlant.planted_at.desc())
            .first()
        )

    if not user_plant:
        return jsonify({"plant": None})

    return jsonify({"plant": serialize_user_plant(user_plant)})
# return all plants    
@plants_bp.get("/user-plants")
@jwt_required()
def get_user_plants():
    user_id = int(get_jwt_identity())

    user_plants = (
        UserPlant.query
        .filter_by(user_id=user_id)
        .order_by(UserPlant.planted_at.desc())
        .all()
    )

    return jsonify({
        "plants": [
            {
                "id": user_plant.id,
                "nickname": user_plant.nickname,
                "total_points": user_plant.total_points,
                "growth_stage": user_plant.growth_stage,
                "planted_at": user_plant.planted_at.isoformat(),
                "last_activity_at": user_plant.last_activity_at.isoformat()
                if user_plant.last_activity_at
                else None,
                "plant_type": {
                    "id": user_plant.plant_type.id,
                    "name": user_plant.plant_type.name,
                    "description": user_plant.plant_type.description,
                    "image_url": user_plant.plant_type.image_url,
                    "emoji": user_plant.plant_type.emoji,
                    "required_points": user_plant.plant_type.required_points,
                },
            }
            for user_plant in user_plants
        ]
    })
    
@plants_bp.delete("/user-plants/<int:user_plant_id>")
@jwt_required()
def delete_user_plant(user_plant_id):
    user_id = int(get_jwt_identity())

    user_plant = UserPlant.query.filter_by(
        id=user_plant_id,
        user_id=user_id,
    ).first()

    if not user_plant:
        return jsonify({"message": "Plant not found."}), 404

    was_current = user_plant.is_current

    db.session.delete(user_plant)
    db.session.flush()

    if was_current:
        next_current_plant = (
            UserPlant.query
            .filter_by(user_id=user_id)
            .order_by(UserPlant.planted_at.desc())
            .first()
        )

        if next_current_plant:
            next_current_plant.is_current = True

    db.session.commit()

    return jsonify({"message": "Plant deleted."})

@plants_bp.patch("/user-plants/<int:user_plant_id>/current")
@jwt_required()
def set_current_user_plant(user_plant_id):
    user_id = int(get_jwt_identity())

    selected_plant = UserPlant.query.filter_by(
        id=user_plant_id,
        user_id=user_id,
    ).first()

    if not selected_plant:
        return jsonify({"message": "Plant not found."}), 404

    UserPlant.query.filter_by(user_id=user_id).update({"is_current": False})

    selected_plant.is_current = True
    db.session.commit()

    return jsonify({
        "plant": serialize_user_plant(selected_plant)
    })