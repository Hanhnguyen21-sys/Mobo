from flask import Blueprint, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.models import Reward, UserReward

rewards_bp = Blueprint("rewards", __name__)


@rewards_bp.get("/rewards")
@jwt_required()
def get_rewards():
    rewards = Reward.query.order_by(Reward.required_points.asc()).all()

    return jsonify({
        "rewards": [
            {
                "id": reward.id,
                "name": reward.name,
                "description": reward.description,
                "required_points": reward.required_points,
                "image_url": reward.image_url,
            }
            for reward in rewards
        ]
    })


@rewards_bp.get("/rewards/me")
@jwt_required()
def get_my_rewards():
    user_id = int(get_jwt_identity())

    user_rewards = UserReward.query.filter_by(user_id=user_id).all()

    return jsonify({
        "rewards": [
            {
                "id": user_reward.id,
                "unlocked_at": user_reward.unlocked_at.isoformat(),
                "reward": {
                    "id": user_reward.reward.id,
                    "name": user_reward.reward.name,
                    "description": user_reward.reward.description,
                    "required_points": user_reward.reward.required_points,
                    "image_url": user_reward.reward.image_url,
                },
            }
            for user_reward in user_rewards
        ]
    })