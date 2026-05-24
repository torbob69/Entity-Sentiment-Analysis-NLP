from pydantic import BaseModel, Field, model_validator
from typing import Annotated
from datetime import date

class predict_queries(BaseModel):
    search_query: Annotated[str, Field(min_length=1, max_length=200)]
    limit: Annotated[int, Field(ge=50, lt=1000)]
    language: str = "en"
    min_likes: Annotated[int, Field(ge=0)] = 0
    verified_only: bool = False
    since: date = Field(default_factory=lambda: date(date.today().year, 1, 1))
    until: date = Field(default_factory=date.today)

    @model_validator(mode="after")
    def validate_date_range(self):
        if self.since > self.until:
            raise ValueError("'since' date must not be after 'until' date")
        if self.until > date.today():
            raise ValueError("'until' date must not be in the future")
        return self