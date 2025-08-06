from dataclasses import dataclass
from typing import List, Union

@dataclass
class Deployment:
    jobId: str
    hostIds: List[int]
    blueprintId: int
    userId: str
    dtype: str
