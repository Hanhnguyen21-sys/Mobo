from datetime import datetime, timezone

from werkzeug.security import check_password_hash, generate_password_hash

from app.extensions import db


def utc_now():
    return datetime.now(timezone.utc)


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    profile_image_url = db.Column(db.String(500))
    created_at = db.Column(db.DateTime(timezone=True), default=utc_now, nullable=False)

    plants = db.relationship("UserPlant", back_populates="user", cascade="all, delete-orphan")
    posts = db.relationship("Post", back_populates="user", cascade="all, delete-orphan")

    def set_password(self, password):
        self.password_hash = generate_password_hash(password, method="pbkdf2:sha256")

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


class PlantType(db.Model):
    __tablename__ = "plant_types"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), unique=True, nullable=False)
    description = db.Column(db.Text, nullable=False)
    image_url = db.Column(db.String(500))
    emoji = db.Column(db.String(20), default="🌱", nullable=False)
    required_points = db.Column(db.Integer, default=0, nullable=False)

    user_plants = db.relationship("UserPlant", back_populates="plant_type")


class UserPlant(db.Model):
    __tablename__ = "user_plants"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    plant_type_id = db.Column(db.Integer, db.ForeignKey("plant_types.id"), nullable=False)
    nickname = db.Column(db.String(120))
    total_points = db.Column(db.Integer, default=0, nullable=False)
    growth_stage = db.Column(db.String(80), default="Seed", nullable=False)
    planted_at = db.Column(db.DateTime(timezone=True), default=utc_now, nullable=False)
    last_activity_at = db.Column(db.DateTime(timezone=True))
    is_current = db.Column(db.Boolean, default=False, nullable=False)
    user = db.relationship("User", back_populates="plants")
    plant_type = db.relationship("PlantType", back_populates="user_plants")


class Emotion(db.Model):
    __tablename__ = "emotions"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)
    category = db.Column(db.String(80), nullable=False)
    icon = db.Column(db.String(20), nullable=False)

    posts = db.relationship("Post", back_populates="emotion")


class Post(db.Model):
    __tablename__ = "posts"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    emotion_id = db.Column(db.Integer, db.ForeignKey("emotions.id"), nullable=False)
    content = db.Column(db.Text, nullable=False)
    image_url = db.Column(db.String(500))
    visibility = db.Column(db.String(20), default="private", nullable=False)
    points_earned = db.Column(db.Integer, default=0, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=utc_now, nullable=False)

    user = db.relationship("User", back_populates="posts")
    emotion = db.relationship("Emotion", back_populates="posts")
    


class Reward(db.Model):
    __tablename__ = "rewards"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), unique=True, nullable=False)
    description = db.Column(db.Text, nullable=False)
    required_points = db.Column(db.Integer, nullable=False)
    image_url = db.Column(db.String(500))

    user_rewards = db.relationship("UserReward", back_populates="reward")


class UserReward(db.Model):
    __tablename__ = "user_rewards"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    reward_id = db.Column(db.Integer, db.ForeignKey("rewards.id"), nullable=False)
    unlocked_at = db.Column(db.DateTime(timezone=True), default=utc_now, nullable=False)

    reward = db.relationship("Reward", back_populates="user_rewards")

    __table_args__ = (
        db.UniqueConstraint("user_id", "reward_id", name="uq_user_reward"),
    )