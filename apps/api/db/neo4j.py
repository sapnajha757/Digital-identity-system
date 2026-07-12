"""
Neo4j driver wrapper. Neo4j is the source of truth for relationships only —
nodes store just {id, type}; full details are always fetched from Postgres
by that id. Keeps the graph lightweight and avoids data duplication.
"""
from collections.abc import Generator
from contextlib import contextmanager

from neo4j import Driver, GraphDatabase

from core.config import get_settings

settings = get_settings()

_driver: Driver | None = None


def get_driver() -> Driver:
    global _driver
    if _driver is None:
        _driver = GraphDatabase.driver(
            settings.neo4j_uri,
            auth=(settings.neo4j_user, settings.neo4j_password),
        )
    return _driver


@contextmanager
def get_session() -> Generator:
    driver = get_driver()
    session = driver.session()
    try:
        yield session
    finally:
        session.close()


def close_driver() -> None:
    global _driver
    if _driver is not None:
        _driver.close()
        _driver = None
