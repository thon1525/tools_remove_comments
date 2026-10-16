from flask import Flask, render_template
from werkzeug.exceptions import RequestEntityTooLarge

from config import Config
from api.routes import api


def create_app() -> Flask:
    app = Flask(
        __name__,
        template_folder="templates",
        static_folder="static",
        static_url_path="/static",
    )

    app.config.from_object(Config)

    # Development: don't cache CSS/JS
    app.config["SEND_FILE_MAX_AGE_DEFAULT"] = 0

    app.register_blueprint(api)

    @app.get("/")
    def index():
        return render_template("index.html")

    @app.errorhandler(RequestEntityTooLarge)
    def handle_file_too_large(_error):
        return {
            "success": False,
            "error": "Uploaded content is too large.",
        }, 413

    @app.errorhandler(404)
    def not_found(_error):
        return {
            "success": False,
            "error": "Resource not found.",
        }, 404

    return app


app = create_app()


if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=False,
    )