# insert hardcode database for plants, emoji, and rewards

from app.extensions import db
from app.models import Emotion, PlantType, Reward


def seed_core_data():
    plants = [
    {
        "name": "Tulip",
        "description": "A bright flower that grows steadily with daily care.",
        "image_url": "",
        "emoji": "🌷",
        "required_points": 0,
    },
    {
        "name": "Sunflower",
        "description": "A warm, resilient plant that follows small moments of light.",
        "image_url": "",
        "emoji": "🌻",
        "required_points": 0,
    },
    {
        "name": "Rose",
        "description": "A classic flower that rewards patience and reflection.",
        "image_url": "",
        "emoji": "🌹",
        "required_points": 0,
    },
    {
        "name": "Cactus",
        "description": "A sturdy plant for users building calm one day at a time.",
        "image_url": "",
        "emoji": "🌵",
        "required_points": 0,
    },
    {
        "name": "Lavender",
        "description": "A peaceful plant connected to calm reflections.",
        "image_url": "",
        "emoji": "🪻",
        "required_points": 0,
    },
]

    emotions = [
        {"name": "Happy", "category": "positive", "icon": "😊"},
        {"name": "Sad", "category": "difficult", "icon": "😢"},
        {"name": "Angry", "category": "difficult", "icon": "😠"},
        {"name": "Anxious", "category": "difficult", "icon": "😟"},
        {"name": "Peaceful", "category": "calm", "icon": "😌"},
        {"name": "Grateful", "category": "positive", "icon": "🙏"},
        {"name": "Excited", "category": "energy", "icon": "✨"},
        {"name": "Tired", "category": "energy", "icon": "😴"},
    ]

    rewards = [
        {
            "name": "First Sprout",
            "description": "Your plant reached its first visible growth.",
            "required_points": 50,
            "image_url": "",
        },
        {
            "name": "New Pot",
            "description": "A simple pot for your growing plant.",
            "required_points": 100,
            "image_url": "",
        },
        {
            "name": "Garden Decoration",
            "description": "A decoration for your future garden.",
            "required_points": 200,
            "image_url": "",
        },
        {
            "name": "Flowering Badge",
            "description": "A badge for reaching flowering growth.",
            "required_points": 300,
            "image_url": "",
        },
    ]

    for plant in plants:
        existing = PlantType.query.filter_by(name=plant["name"]).first()

        if existing:
            existing.description = plant["description"]
            existing.image_url = plant["image_url"]
            existing.emoji = plant["emoji"]
            existing.required_points = plant["required_points"]
        else:
            db.session.add(PlantType(**plant))

    for emotion in emotions:
        existing = Emotion.query.filter_by(name=emotion["name"]).first()
        if not existing:
            db.session.add(Emotion(**emotion))

    for reward in rewards:
        existing = Reward.query.filter_by(name=reward["name"]).first()
        if not existing:
            db.session.add(Reward(**reward))

    db.session.commit()