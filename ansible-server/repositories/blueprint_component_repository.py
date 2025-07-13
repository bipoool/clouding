from database.connection import get_connection
from models.blueprint_component import BlueprintComponent
from typing import Optional

def get_blueprint_component_by_id(component_id: int) -> Optional[BlueprintComponent]:
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT id, blueprint_id, component_id, position, parameters, created_at, updated_at
                FROM blueprint_components
                WHERE id = %s
            """, (component_id,))
            row = cur.fetchone()
            return BlueprintComponent(**row) if row else None
    finally:
        conn.close()
