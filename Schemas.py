# schemas.py
from pydantic import BaseModel, Field
from typing import Optional

class PolicySchema(BaseModel):
    plan_name: str = Field(...)
    premium_amount: float = Field(...)
    tenure: int = Field(...)
    description: str = Field(...)
    benefits: str = Field(...) # Comma-separated string from Admin

    class Config:
        json_schema_extra = {
            "example": {
                "plan_name": "Platinum Shield",
                "premium_amount": 1200.0,
                "tenure": 10,
                "description": "Comprehensive auto coverage.",
                "benefits": "Cashless Garage, 24/7 Roadside, Zero Dep"
            }
        }
