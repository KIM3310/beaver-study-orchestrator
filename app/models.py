from __future__ import annotations

from datetime import date
from typing import List, Literal, Optional

from pydantic import BaseModel, Field, field_validator


TaskType = Literal[
    "assignment",
    "project",
    "exam",
    "quiz",
    "lab",
    "report",
    "milestone",
]


class Task(BaseModel):
    title: str = Field(..., min_length=3, max_length=120)
    due_date: date
    task_type: TaskType
    estimated_hours: float = Field(..., gt=0, le=80)
    difficulty: float = Field(..., ge=0.1, le=1.0)
    impact_weight: float = Field(..., ge=0.1, le=2.0)
    source_line: Optional[str] = Field(default=None, max_length=300)


class ExtractionRequest(BaseModel):
    syllabus_text: str = Field(..., min_length=20, max_length=20000)
    reference_year: Optional[int] = Field(default=None, ge=2024, le=2030)

    @field_validator("syllabus_text")
    @classmethod
    def strip_syllabus_text(cls, value: str) -> str:
        return value.strip()


class ExtractionResponse(BaseModel):
    tasks: List[Task]
    discarded_lines: List[str]


class WeeklyAvailability(BaseModel):
    monday: float = Field(..., ge=0, le=12)
    tuesday: float = Field(..., ge=0, le=12)
    wednesday: float = Field(..., ge=0, le=12)
    thursday: float = Field(..., ge=0, le=12)
    friday: float = Field(..., ge=0, le=12)
    saturday: float = Field(..., ge=0, le=12)
    sunday: float = Field(..., ge=0, le=12)

    def as_list(self) -> List[float]:
        return [
            self.monday,
            self.tuesday,
            self.wednesday,
            self.thursday,
            self.friday,
            self.saturday,
            self.sunday,
        ]


class PlanRequest(BaseModel):
    tasks: List[Task] = Field(..., min_length=1, max_length=80)
    availability: WeeklyAvailability
    start_date: Optional[date] = None


class DailyPlanItem(BaseModel):
    date: date
    task_title: str
    task_type: TaskType
    hours: float


class UnscheduledItem(BaseModel):
    task_title: str
    unscheduled_hours: float


class StudyPlan(BaseModel):
    items: List[DailyPlanItem]
    utilization: float = Field(..., ge=0, le=1.5)
    total_required_hours: float
    total_allocated_hours: float
    unscheduled: List[UnscheduledItem]


class RiskDriver(BaseModel):
    label: str
    effect: float


class RiskAssessment(BaseModel):
    score: float = Field(..., ge=0, le=1)
    level: Literal["low", "medium", "high"]
    rationale: str
    top_drivers: List[RiskDriver]
    recommendations: List[str] = Field(default_factory=list)


class PlanResponse(BaseModel):
    study_plan: StudyPlan
    risk: RiskAssessment


class WhatIfRequest(BaseModel):
    tasks: List[Task] = Field(..., min_length=1, max_length=80)
    availability: WeeklyAvailability
    daily_boost: float = Field(default=1.0, ge=0.5, le=4.0)


class ScenarioSnapshot(BaseModel):
    label: str
    risk_score: float = Field(..., ge=0, le=1)
    risk_level: Literal["low", "medium", "high"]
    allocated_hours: float
    unscheduled_hours: float


class WhatIfResponse(BaseModel):
    baseline: ScenarioSnapshot
    boosted: ScenarioSnapshot
    risk_reduction: float
    recommendation: str


class AnalyzeRequest(BaseModel):
    syllabus_text: str = Field(..., min_length=20, max_length=20000)
    availability: WeeklyAvailability
    reference_year: Optional[int] = Field(default=None, ge=2024, le=2030)
    start_date: Optional[date] = None

    @field_validator("syllabus_text")
    @classmethod
    def strip_syllabus_text(cls, value: str) -> str:
        return value.strip()


class AnalyzeResponse(BaseModel):
    extraction: ExtractionResponse
    plan: PlanResponse


class HealthResponse(BaseModel):
    status: Literal["ok"]
    service: str
