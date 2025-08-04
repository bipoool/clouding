from dataclasses import dataclass
from typing import List, Union

@dataclass
class Plan:
    jobId: str
    hostIds: List[int]
    blueprintId: int
    userId: str
