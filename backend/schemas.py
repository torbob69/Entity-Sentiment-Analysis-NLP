from pydantic import BaseModel, Field, model_validator
from typing import Annotated
from fastapi import Query
from datetime import date

date_object = date(date.today().year, 1, 1)

class predict_queries(BaseModel):
    search_query: Annotated[str, Field(min_length=1, max_length=200)]
    limit: Annotated[int, Query(ge=50, lt=1000)]
    languange: str = "en"
    min_likes: Annotated[int, Query(ge=0)] = 0
    verified_only: bool = False
    since: date = date_object
    until: date = date.today()

    @model_validator(mode="after")
    def validate_date_range(self):
        if self.since > self.until:
            raise ValueError("'since' date must not be after 'until' date")
        if self.until > date.today():
            raise ValueError("'until' date must not be in the future")
        return self
    
class entity:
    name : str
    activity : str
    sentiment : str

class tweet:
    text: str
    sentiment : str
    entity : list[entity]