from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config import DATABASE_URL

# pool_pre_ping checks each pooled connection is alive before use (and reconnects
# if not), so a restarted/failed-over database doesn't surface as
# "server closed the connection unexpectedly" 500s. pool_recycle drops
# connections older than 30 min to avoid stale ones lingering.
engine = create_engine(DATABASE_URL, pool_pre_ping=True, pool_recycle=1800)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()