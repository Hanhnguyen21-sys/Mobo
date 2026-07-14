from flask import Flask, jsonify
from flask_cors import CORS

from app.config import Config
from app.extensions import db, jwt, migrate

def create_app(config_object=Config):
    app = Flask(__name__)
    app.config.from_object(config_object)

    allowed_origins = [
        origin.strip()
        for origin in app.config["FRONTEND_ORIGIN"].split(",")
        if origin.strip()
    ]

    CORS(
        app,
        resources={r"/api/*": {"origins": allowed_origins}},
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    )

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    # your blueprints here

    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok", "service": "mobo-backend"})

    return app