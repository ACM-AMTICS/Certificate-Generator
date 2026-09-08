from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class EventModel(BaseModel):
    id: str = Field(..., alias="_id")
    name: str
    active: bool = True
    description: Optional[str] = "ACM Official Event"
    date: Optional[str] = None

    class Config:
        populate_by_name = True

class ClaimRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Participant full name")
    device_token: str = Field(..., min_length=10, max_length=100, description="Browser device UUID token")

class CertificateRecord(BaseModel):
    event_id: str
    name: str
    device_token: str
    certificate_number: str
    created_at: str

class ClaimResponse(BaseModel):
    certificate_number: str
    name: str
    event_name: str
    created_at: str
    already_claimed: bool = False
    message: Optional[str] = None

class RegistrationItem(BaseModel):
    certificate_number: str
    name: str
    device_token: str
    created_at: str

class RegistrationsResponse(BaseModel):
    event_id: str
    event_name: str
    total_issued: int
    registrations: List[RegistrationItem]
