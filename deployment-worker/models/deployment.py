from dataclasses import dataclass
from typing import List, Union
from datetime import datetime
from uuid import UUID
from enum import Enum

class DeploymentStatus(Enum):
    PENDING = "pending"
    STARTED = "started"
    COMPLETED = "completed"
    FAILED = "failed"

class DeploymentHostStatus(Enum):
    PENDING = "pending"
    STARTED = "started"
    COMPLETED = "completed"
    FAILED = "failed"

@dataclass
class DeploymentRabbitMqPayload:
    jobId: str
    hostIds: List[int]
    blueprintId: int
    userId: str
    dtype: str

@dataclass
class Deployment:
    id: UUID
    user_id: UUID
    blueprint_id: int
    type: str
    status: DeploymentStatus
    created_at: datetime
    updated_at: datetime

@dataclass
class DeploymentHostMapping:
    deployment_id: UUID
    host_id: int
    status: DeploymentHostStatus
