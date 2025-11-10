from pydantic import BaseModel, datetime
from enum import Enum


class Status(str, Enum):
    IN_PROGRESS = "In progress"
    COMPLETED = "Completed"
    CANCELED = "Canceled"
    PLANNED = "planned"


class EventModel(BaseModel):
    title: str
    description: str
    start_date: datetime
    end_date: datetime
    status: Status
    estimated_budget: int
    notes: str