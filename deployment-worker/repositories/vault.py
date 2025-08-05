import os
import logging
from typing import Dict, Any, Optional
import hvac
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

class VaultRepository:
    def __init__(self):
        """Initialize Vault connection using environment variables"""
        self.vault_url = os.getenv('VAULT_ADDR')
        self.vault_token = os.getenv('VAULT_TOKEN')
        self.vault_secret_engine = os.getenv('VAULT_SECRET_ENGINE')
        
        if not self.vault_url or not self.vault_token:
            raise ValueError("VAULT_URL and VAULT_TOKEN must be set in environment variables")
        
        self.client = hvac.Client(
            url=self.vault_url,
            token=self.vault_token,
            namespace=''
        )
        
        # Test the connection
        if not self.client.is_authenticated():
            raise Exception("Failed to authenticate with Vault")
        
        logger.info("Successfully connected to Vault")

    def get_credentials_by_name(self, secret_name: str) -> Optional[Dict[str, Any]]:
        """
        Fetch credentials from Vault using the secret name
        
        Args:
            secret_name: Name of the secret to fetch
            secret_path: Path where the secret is stored (default: "secret")
            
        Returns:
            Dictionary containing the secret data, or None if not found
        """
        try:
            # Read the secret from Vault
            secret_response = self.client.secrets.kv.v2.read_secret_version(
                path=secret_name,
                mount_point=self.vault_secret_engine
            )

            if secret_response and 'data' in secret_response:
                secret_data = secret_response['data']['data']
                logger.info(f"Successfully retrieved secret: {secret_name}")
                return secret_data
            else:
                logger.warning(f"Secret not found or empty: {secret_name}")
                return None
                
        except hvac.exceptions.InvalidPath:
            logger.error(f"Secret path not found: {secret_name}")
            return None
        except hvac.exceptions.Forbidden:
            logger.error(f"Access denied to secret: {secret_name}")
            return None
        except Exception as e:
            logger.error(f"Error retrieving secret {secret_name}: {str(e)}")
            return None

# Global instance for easy access
vault_repository = VaultRepository()

def get_credentials_by_name(secret_name: str) -> Optional[Dict[str, Any]]:
    """
    Convenience function to get credentials from Vault using name
    
    Args:
        secret_name: Name of the secret to fetch
        secret_path: Path where the secret is stored (default: "secret")
        
    Returns:
        Dictionary containing the secret data, or None if not found
    """
    return vault_repository.get_credentials_by_name(secret_name)
