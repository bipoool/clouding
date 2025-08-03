from dataclasses import dataclass
from typing import Optional, Dict, Any
from datetime import datetime
import uuid

@dataclass
class Host:
    id: int
    userid: uuid.UUID
    name: str
    ip: str
    os: str
    credentialid: int
    metadata: Optional[Dict[str, Any]] = None
    createdat: Optional[datetime] = None
    updatedat: Optional[datetime] = None 