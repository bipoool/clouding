from dataclasses import dataclass
from typing import Optional, Dict
from datetime import datetime

@dataclass
class BlueprintComponent:
    id: int
    blueprint_id: int
    component_id: int
    position: int
    parameters: Optional[Dict]  # JSONB field
    created_at: datetime
    updated_at: datetime