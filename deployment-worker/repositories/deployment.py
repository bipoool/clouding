from database.connection import getConnection
from models.deployment import Deployment, DeploymentStatus
from typing import Optional
from uuid import UUID

def getDeployment(deploymentId: UUID) -> Optional[Deployment]:
    """
    Fetch a deployment by its ID
    
    Args:
        deploymentId: UUID of the deployment to fetch
        
    Returns:
        Deployment object if found, None otherwise
    """
    conn = getConnection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT 
                    id,
                    user_id,
                    blueprint_id,
                    type,
                    status,
                    created_at,
                    updated_at
                FROM deployments 
                WHERE id = %s
            """, (deploymentId,))
            row = cur.fetchone()
            if row:
                # Convert status string to enum
                row['status'] = DeploymentStatus(row['status'])
                return Deployment(**row)
            return None
    finally:
        conn.close()

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
