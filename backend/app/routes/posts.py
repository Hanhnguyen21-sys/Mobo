from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.extensions import db
from app.models import Emotion, Post, Reward, UserPlant, UserReward, utc_now

posts_bp = Blueprint("posts", __name__)

def unlock_rewards(user_id, total_points):
    unlocked_rewards = []

    rewards = Reward.query.filter(Reward.required_points <= total_points).all()

    for reward in rewards:
        existing = UserReward.query.filter_by(
            user_id=user_id,
            reward_id=reward.id
        ).first()

        if not existing:
            user_reward = UserReward(
                user_id=user_id,
                reward_id=reward.id,
            )
            db.session.add(user_reward)
            unlocked_rewards.append(reward)

    return unlocked_rewards
def calculate_reflection_points(content, image_url=None):
    points = 10

    if image_url:
        points += 5

    if len(content.strip()) >= 160:
        points += 5

    return points


def get_growth_stage(total_points):
    if total_points >= 301:
        return "Flowering plant"
    if total_points >= 181:
        return "Mature plant"
    if total_points >= 101:
        return "Young plant"
    if total_points >= 51:
        return "Small plant"
    if total_points >= 21:
        return "Sprout"
    return "Seed"


@posts_bp.get("/emotions")
@jwt_required()
def get_emotions():
    emotions = Emotion.query.order_by(Emotion.name.asc()).all()

    return jsonify({
        "emotions": [
            {
                "id": emotion.id,
                "name": emotion.name,
                "category": emotion.category,
                "icon": emotion.icon,
            }
            for emotion in emotions
        ]
    })


@posts_bp.post("/posts")
@jwt_required()
def create_post():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    content = (data.get("content") or "").strip()
    emotion_id = data.get("emotion_id")
    image_url = (data.get("image_url") or "").strip()
    visibility = data.get("visibility") or "private"

    if not content:
        return jsonify({"message": "Reflection content is required."}), 400

    if not emotion_id:
        return jsonify({"message": "emotion_id is required."}), 400

    if visibility not in ["private", "friends"]:
        return jsonify({"message": "Visibility must be private or friends."}), 400

    emotion = db.session.get(Emotion, emotion_id)

    if not emotion:
        return jsonify({"message": "Emotion not found."}), 404

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
    points = calculate_reflection_points(content, image_url)

    post = Post(
        user_id=user_id,
        emotion_id=emotion.id,
        content=content,
        image_url=image_url or None,
        visibility=visibility,
        points_earned=points,
    )

    user_plant.total_points += points
    user_plant.growth_stage = get_growth_stage(user_plant.total_points)
    user_plant.last_activity_at = utc_now()

    db.session.add(post)

    unlocked_rewards = unlock_rewards(user_id, user_plant.total_points)

    db.session.commit()

    return jsonify({
    "post": {
        "id": post.id,
        "content": post.content,
        "image_url": post.image_url,
        "visibility": post.visibility,
        "points_earned": post.points_earned,
        "created_at": post.created_at.isoformat(),
        "emotion": {
            "id": emotion.id,
            "name": emotion.name,
            "category": emotion.category,
            "icon": emotion.icon,
        },
    },
    "plant": {
        "id": user_plant.id,
        "nickname": user_plant.nickname,
        "total_points": user_plant.total_points,
        "growth_stage": user_plant.growth_stage,
        "last_activity_at": user_plant.last_activity_at.isoformat(),
    },
    "unlocked_rewards": [
        {
            "id": reward.id,
            "name": reward.name,
            "description": reward.description,
            "required_points": reward.required_points,
            "image_url": reward.image_url,
        }
        for reward in unlocked_rewards
    ],
}), 201


@posts_bp.get("/posts/me")
@jwt_required()
def get_my_posts():
    user_id = int(get_jwt_identity())

    posts = (
        Post.query
        .filter_by(user_id=user_id)
        .order_by(Post.created_at.desc())
        .all()
    )

    return jsonify({
        "posts": [
            {
                "id": post.id,
                "content": post.content,
                "image_url": post.image_url,
                "visibility": post.visibility,
                "points_earned": post.points_earned,
                "created_at": post.created_at.isoformat(),
                "emotion": {
                    "id": post.emotion.id,
                    "name": post.emotion.name,
                    "category": post.emotion.category,
                    "icon": post.emotion.icon,
                },
            }
            for post in posts
        ]
    })
    
@posts_bp.delete("/posts/<int:post_id>")
@jwt_required()
def delete_post(post_id):
    user_id = int(get_jwt_identity())

    post = Post.query.filter_by(
        id=post_id,
        user_id=user_id
    ).first()

    if not post:
        return jsonify({"message": "Post not found."}), 404

    db.session.delete(post)
    db.session.commit()

    return jsonify({"message": "Post deleted."})