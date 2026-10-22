import os

from sqlalchemy import create_engine


def get_engine():
    return create_engine(os.getenv("DATABASE_URL", "sqlite:///data/art_fashion.db"))