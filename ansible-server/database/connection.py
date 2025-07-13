import psycopg2
from psycopg2.extras import RealDictCursor

import os
from dotenv import load_dotenv

load_dotenv()  # loads from .env

DB_CONFIG = {
    'dbname': os.environ.get('SQL.DB'),
    'user': os.environ.get('SQL.USERNAME'),
    'password': os.environ.get('SQL.PASSWORD'),
    'host': os.environ.get('SQL.HOST', 'localhost'),
    'port': int(os.environ.get('SQL.PORT', 5432)),
}

def get_connection():
    return psycopg2.connect(cursor_factory=RealDictCursor, **DB_CONFIG)