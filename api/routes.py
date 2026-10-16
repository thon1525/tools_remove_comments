from flask import Blueprint, current_app, jsonify, request

from services.comment_remover import clean_code
from utils.files import read_uploaded_file
from utils.language import (
    detect_language,
    supported_languages,
)


api = Blueprint(
    "api",
    __name__,
    url_prefix="/api/v1",
)


@api.after_request
def security_headers(response):
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = (
        "camera=(), microphone=(), geolocation=()"
    )

    return response


@api.get("/health")
def health():
    return jsonify({
        "success": True,
        "service": "code-cleaner",
        "status": "healthy",
    })


@api.get("/languages")
def languages():
    return jsonify({
        "success": True,
        "languages": supported_languages(),
    })


@api.post("/clean")
def clean():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "success": False,
            "error": "Request body must be JSON.",
        }), 400

    language = data.get("language")
    source = data.get("code")

    if not isinstance(language, str):
        return jsonify({
            "success": False,
            "error": "language is required.",
        }), 400

    if not isinstance(source, str):
        return jsonify({
            "success": False,
            "error": "code must be a string.",
        }), 400

    if len(source.encode("utf-8")) > current_app.config["MAX_FILE_SIZE"]:
        return jsonify({
            "success": False,
            "error": "Code exceeds the maximum allowed size.",
        }), 413

    options = data.get("options")

    if not isinstance(options, dict):
        options = {}

    preserve_blank_lines = bool(
        options.get("preserve_blank_lines", True)
    )

    try:
        cleaned = clean_code(
            source=source,
            language=language.lower().strip(),
            preserve_blank_lines=preserve_blank_lines,
        )

    except ValueError as exc:
        return jsonify({
            "success": False,
            "error": str(exc),
        }), 400

    return jsonify({
        "success": True,
        "language": language.lower().strip(),
        "changed": cleaned != source,
        "original_size": len(source),
        "cleaned_size": len(cleaned),
        "code": cleaned,
    })


@api.post("/clean/file")
def clean_file():
    uploaded = request.files.get("file")

    if uploaded is None:
        return jsonify({
            "success": False,
            "error": "No file was uploaded.",
        }), 400

    if not uploaded.filename:
        return jsonify({
            "success": False,
            "error": "Filename is required.",
        }), 400

    language = detect_language(uploaded.filename)

    if language is None:
        return jsonify({
            "success": False,
            "error": "Unsupported file type.",
        }), 400

    try:
        source = read_uploaded_file(
            uploaded,
            max_bytes=current_app.config["MAX_FILE_SIZE"],
        )

        cleaned = clean_code(
            source=source,
            language=language,
            preserve_blank_lines=True,
        )

    except ValueError as exc:
        return jsonify({
            "success": False,
            "error": str(exc),
        }), 400

    return jsonify({
        "success": True,
        "filename": uploaded.filename,
        "language": language,
        "changed": cleaned != source,
        "original_size": len(source),
        "cleaned_size": len(cleaned),
        "code": cleaned,
    })