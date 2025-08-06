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
        self.vaultUrl = os.getenv('VAULT_ADDR')
        self.vaultToken = os.getenv('VAULT_TOKEN')
        self.vaultSecretEngine = os.getenv('VAULT_SECRET_ENGINE')
        
        if not self.vaultUrl or not self.vaultToken:
            raise ValueError("VAULT_URL and VAULT_TOKEN must be set in environment variables")
        
        self.client = hvac.Client(
            url=self.vaultUrl,
            token=self.vaultToken,
            namespace=''
        )
        
        # Test the connection
        if not self.client.is_authenticated():
            raise Exception("Failed to authenticate with Vault")
        
        logger.info("Successfully connected to Vault")

    def getCredentialsByName(self, secretName: str) -> Optional[Dict[str, Any]]:
        """
        Fetch credentials from Vault using the secret name
        
        Args:
            secretName: Name of the secret to fetch
            secretPath: Path where the secret is stored (default: "secret")
            
        Returns:
            Dictionary containing the secret data, or None if not found
        """
        try:
            # Read the secret from Vault
            secretResponse = self.client.secrets.kv.v2.read_secret_version(
                path=secretName,
                mount_point=self.vaultSecretEngine
            )

            if secretResponse and 'data' in secretResponse:
                secretData = secretResponse['data']['data']
                logger.info(f"Successfully retrieved secret: {secretName}")
                return secretData
            else:
                logger.warning(f"Secret not found or empty: {secretName}")
                return None
                
        except hvac.exceptions.InvalidPath:
            logger.error(f"Secret path not found: {secretName}")
            return None
        except hvac.exceptions.Forbidden:
            logger.error(f"Access denied to secret: {secretName}")
            return None
        except Exception as e:
            logger.error(f"Error retrieving secret {secretName}: {str(e)}")
            return None

# Global instance for easy access
vaultRepository = VaultRepository()

def getCredentialsByName(secretName: str) -> Optional[Dict[str, Any]]:
    """
    Convenience function to get credentials from Vault using name
    
    Args:
        secretName: Name of the secret to fetch
        secretPath: Path where the secret is stored (default: "secret")
        
    Returns:
        Dictionary containing the secret data, or None if not found
    """
    return vaultRepository.getCredentialsByName(secretName)
