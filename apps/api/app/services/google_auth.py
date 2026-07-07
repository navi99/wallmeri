"""Verify Google Identity Services ID tokens server-side."""
from dataclasses import dataclass

from google.auth.transport import requests as google_requests
from google.oauth2 import id_token

from app.core.config import settings


class GoogleAuthError(ValueError):
    pass


@dataclass
class GoogleIdentity:
    sub: str
    email: str
    name: str


def is_configured() -> bool:
    return bool(settings.GOOGLE_CLIENT_ID)


def verify_id_token(credential: str) -> GoogleIdentity:
    if not is_configured():
        raise GoogleAuthError("Google sign-in is not configured")
    try:
        info = id_token.verify_oauth2_token(
            credential, google_requests.Request(), settings.GOOGLE_CLIENT_ID
        )
    except ValueError as exc:
        raise GoogleAuthError("Invalid Google credential") from exc

    if not info.get("email_verified"):
        raise GoogleAuthError("Google account email is not verified")
    return GoogleIdentity(
        sub=info["sub"],
        email=info["email"].lower(),
        name=info.get("name", ""),
    )
