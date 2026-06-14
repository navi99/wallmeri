from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import ACCESS, decode_token
from app.models import User

# auto_error=False so optional-auth endpoints (guest checkout) can pass through.
bearer_scheme = HTTPBearer(auto_error=False)


def _user_from_credentials(
    credentials: Optional[HTTPAuthorizationCredentials], db: Session
) -> Optional[User]:
    if credentials is None:
        return None
    payload = decode_token(credentials.credentials, expected_type=ACCESS)
    if not payload:
        return None
    sub = payload.get("sub")
    if sub is None:
        return None
    return db.get(User, int(sub))


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    user = _user_from_credentials(credentials, db)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> Optional[User]:
    return _user_from_credentials(credentials, db)


def get_current_admin(user: User = Depends(get_current_user)) -> User:
    if not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required"
        )
    return user
