from dataclasses import dataclass

@dataclass
class PlaybookInfo:
    playbookName: str
    playbookDir: str
    blueprintId: int
    userId: str
    jobId: str
