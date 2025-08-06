from database.connection import getConnection
from models.host import Host
from models.credential import Credential
from typing import List, Tuple

def getHostsWithCredentials(hostIds: List[int]) -> List[Tuple[Host, Credential]]:
    """
    Fetch hosts with their associated credentials by an array of host IDs
    
    Args:
        hostIds: List of host IDs to fetch
        
    Returns:
        List of tuples containing (Host, Credential) pairs
    """
    if not hostIds:
        return []
    
    conn = getConnection()
    try:
        with conn.cursor() as cur:
            # Create placeholders for the IN clause
            placeholders = ','.join(['%s'] * len(hostIds))
            
            cur.execute(f"""
                SELECT 
                    h.id,
                    h.user_id as userid,
                    h.name,
                    h.ip,
                    h.os,
                    h.credential_id as credentialid,
                    h.meta_data as metadata,
                    h.created_at as createdat,
                    h.updated_at as updatedat,
                    c.id as cred_id,
                    c.name as cred_name,
                    c.type as cred_type,
                    c.user_id as cred_userid,
                    c.expires_at as cred_expiresat,
                    c.created_at as cred_createdat,
                    c.updated_at as cred_updatedat
                FROM hosts h
                JOIN credentials c ON h.credential_id = c.id
                WHERE h.id IN ({placeholders})
            """, tuple(hostIds))
            
            rows = cur.fetchall()
            result = []
            for row in rows:
                # Split the row into host and credential data
                hostData = {
                    'id': row['id'],
                    'userid': row['userid'],
                    'name': row['name'],
                    'ip': row['ip'],
                    'os': row['os'],
                    'credentialid': row['credentialid'],
                    'metadata': row['metadata'],
                    'createdat': row['createdat'],
                    'updatedat': row['updatedat']
                }
                
                credentialData = {
                    'id': row['cred_id'],
                    'name': row['cred_name'],
                    'type': row['cred_type'],
                    'userid': row['cred_userid'],
                    'expiresat': row['cred_expiresat'],
                    'createdat': row['cred_createdat'],
                    'updatedat': row['cred_updatedat']
                }
                
                host = Host(**hostData)
                credential = Credential(**credentialData)
                result.append((host, credential))
            
            return result
    finally:
        conn.close() 