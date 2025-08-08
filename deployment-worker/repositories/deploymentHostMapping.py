from database.connection import getConnection
from models.deployment import DeploymentHostStatus
from typing import List
from uuid import UUID

def updateDeploymentHostStatus(deploymentId: UUID, hostIds: List[int], status: DeploymentHostStatus) -> bool:
    """
    Update the status of deployment host mappings for multiple hosts
    
    Args:
        deploymentId: UUID of the deployment
        hostIds: List of host IDs to update
        status: New status value (DeploymentHostStatus enum)
        
    Returns:
        True if update was successful, False otherwise
    """
    if not hostIds:
        return False
    
    conn = getConnection()
    try:
        with conn.cursor() as cur:
            # Create placeholders for the IN clause
            placeholders = ','.join(['%s'] * len(hostIds))
            
            cur.execute(f"""
                UPDATE deployment_host_mappings 
                SET status = %s
                WHERE deployment_id = %s AND host_id IN ({placeholders})
            """, (status.value, deploymentId, *hostIds))
            conn.commit()
            return cur.rowcount > 0
    finally:
        conn.close()
