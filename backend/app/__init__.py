from flask import Flask, jsonify
from flask_cors import CORS

from app.config import Config
from app.extensions import db, jwt, migrate
from app import models
from app.seed import seed_core_data
from app.routes.auth import auth_bp
from app.routes.plants import plants_bp
from app.routes.posts import posts_bp
from app.routes.rewards import rewards_bp
def create_app(config_object=Config):
    app = Flask(__name__)
    app.config.from_object(config_object)
    
    
    allowed_origins = [
        origin.strip()
        for origin in app.config["FRONTEND_ORIGIN"].split(",")
        ]

    CORS(app, resources={r"/api/*": {"origins": allowed_origins}})  
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(plants_bp, url_prefix="/api")
    app.register_blueprint(posts_bp, url_prefix="/api")
    app.register_blueprint(rewards_bp, url_prefix="/api")
    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok", "service": "mobo-backend"})

    @app.cli.command("seed")
    def seed_command():
        seed_core_data()
        print("Seed data created")
    return app