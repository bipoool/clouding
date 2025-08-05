from typing import Optional, Dict, Any
from dataclasses import dataclass
import uuid
from datetime import datetime

@dataclass
class Credential:
    id: int
    name: str
    type: str  # credential_type enum
    userid: uuid.UUID
    expiresat: Optional[datetime] = None
    createdat: Optional[datetime] = None
    updatedat: Optional[datetime] = None
    value: Optional[Dict[str, Any]] = None 