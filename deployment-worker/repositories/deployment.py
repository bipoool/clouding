from database.connection import getConnection
from uuid import UUID

def updateDeploymentStatusToStarted(deploymentId: UUID) -> bool:
    """
    Update the status of a deployment to started
    
    Args:
        deploymentId: UUID of the deployment to update
        
    Returns:
        True if update was successful, False otherwise
    """
    conn = getConnection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                UPDATE deployments 
                SET status = 'started', updated_at = NOW()
                WHERE id = %s AND status='pending'
            """, (deploymentId,))
            conn.commit()
            return cur.rowcount > 0
    finally:
        conn.close()

def updateDeploymentStatusToCompleted(deploymentId: UUID) -> bool:
    """
    Update the status of a deployment to completed
    
    Args:
        deploymentId: UUID of the deployment to update
        
    Returns:
        True if update was successful, False otherwise
    """
    conn = getConnection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                UPDATE deployments 
                SET status = 'completed', updated_at = NOW()
                WHERE id = %s AND status='started'
            """, (deploymentId,))
            conn.commit()
            return cur.rowcount > 0
    finally:
        conn.close()

def updateDeploymentStatusToFailed(deploymentId: UUID) -> bool:
    """
    Update the status of a deployment to failed
    
    Args:
        deploymentId: UUID of the deployment to update
        
    Returns:
        True if update was successful, False otherwise
    """
    conn = getConnection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                UPDATE deployments 
                SET status = 'failed', updated_at = NOW()
                WHERE id = %s AND status='started'
            """, (deploymentId,))
            conn.commit()
            return cur.rowcount > 0
    finally:
        conn.close()
