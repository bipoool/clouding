import psycopg2
from psycopg2.extras import RealDictCursor

import os
from dotenv import load_dotenv

load_dotenv()  # loads from .env

DB_CONFIG = {
    'dbname': os.environ.get('SQL_DB'),
    'user': os.environ.get('SQL_USERNAME'),
    'password': os.environ.get('SQL_PASSWORD'),
    'host': os.environ.get('SQL_HOST', 'localhost'),
    'port': int(os.environ.get('SQL_PORT', 5432)),
}

def getConnection():
    return psycopg2.connect(cursor_factory=RealDictCursor, **DB_CONFIG)