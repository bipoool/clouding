from dataclasses import dataclass
from typing import Optional
from datetime import datetime
import uuid

@dataclass
class Credential:
    id: int
    name: str
    type: str  # credential_type enum
    userid: uuid.UUID
    expiresat: Optional[datetime] = None
    createdat: Optional[datetime] = None
    updatedat: Optional[datetime] = None 