from database.connection import get_connection
from models.blueprint import BlueprintComponent, Blueprint
from typing import Optional, List

def getBlueprintComponents(blueprintId: int) -> Optional[List[BlueprintComponent]]:
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT 
                bc.id as id,
                bc.position as position, 
                c.id as componentid,
                c.ansible_role as ansiblerole,
                c.parameters as componentparameters,
                bc.parameters as blueprintparameters
                FROM blueprint_components bc
                JOIN components c ON c.id = bc.component_id
                WHERE bc.blueprint_id = %s
            """, (blueprintId,))
            rows = cur.fetchall()
            return [BlueprintComponent(**row) for row in rows]
    finally:
        conn.close()

def getBlueprint(blueprintId: int) -> Optional[Blueprint]:
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT id, name, status FROM blueprints WHERE id = %s
            """, (blueprintId,))
            row = cur.fetchone()
            return Blueprint(**row) if row else None
    finally:
        conn.close()