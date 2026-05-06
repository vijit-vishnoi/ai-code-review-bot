from pydantic import BaseModel
from typing import List

class ReviewRequest(BaseModel):
    code: str
    language: str

class Issue(BaseModel):
    line: int | None = None
    description: str
    suggestion: str

class CodeReviewResponse(BaseModel):
    bugs: List[Issue]
    style: List[Issue]
    security: List[Issue]
    summary: str
    score: int
