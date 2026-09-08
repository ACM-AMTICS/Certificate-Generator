from fastapi import APIRouter, HTTPException, status
from datetime import datetime, timezone
import logging
from pymongo.errors import DuplicateKeyError
from app.database import get_database
from app.models import ClaimRequest, ClaimResponse, RegistrationsResponse, RegistrationItem

router = APIRouter(prefix="/api")
logger = logging.getLogger("acm_backend")

@router.get("/events/{event_id}")
async def get_event(event_id: str):
    db = get_database()
    event = await db.events.find_one({"_id": event_id})
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event '{event_id}' not found."
        )
    if not event.get("active", True):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Event '{event_id}' is no longer active for certificate claims."
        )
    return {
        "id": event["_id"],
        "name": event.get("name", "ACM Event"),
        "active": event.get("active", True),
        "description": event.get("description", ""),
        "date": event.get("date", "")
    }

@router.post("/events/{event_id}/claim", response_model=ClaimResponse)
async def claim_certificate(event_id: str, request: ClaimRequest):
    db = get_database()
    
    # Clean participant name
    name = request.name.strip()
    if not name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Participant name cannot be empty."
        )
    
    device_token = request.device_token.strip()

    # Verify event exists and is active
    event = await db.events.find_one({"_id": event_id})
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event '{event_id}' not found."
        )
    if not event.get("active", True):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Event '{event_id}' is inactive."
        )
    
    event_name = event.get("name", "ACM Event")

    # Check if this device token already claimed a certificate for this event
    existing_cert = await db.certificates.find_one({
        "event_id": event_id,
        "device_token": device_token
    })
    
    if existing_cert:
        return ClaimResponse(
            certificate_number=existing_cert["certificate_number"],
            name=existing_cert["name"],
            event_name=event_name,
            created_at=existing_cert["created_at"],
            already_claimed=True,
            message="A certificate has already been claimed using this browser device."
        )

    # Safe sequential numbering per event
    count = await db.certificates.count_documents({"event_id": event_id})
    cert_seq = count + 1
    
    # Extract year from event date or default to current year
    year = datetime.now(timezone.utc).year
    cert_number = f"ACM-{year}-{cert_seq:03d}"
    
    created_at_iso = datetime.now(timezone.utc).isoformat()

    cert_doc = {
        "event_id": event_id,
        "name": name,
        "device_token": device_token,
        "certificate_number": cert_number,
        "created_at": created_at_iso
    }

    try:
        await db.certificates.insert_one(cert_doc)
        logger.info(f"Certificate {cert_number} issued to '{name}' for event '{event_id}'")
        return ClaimResponse(
            certificate_number=cert_number,
            name=name,
            event_name=event_name,
            created_at=created_at_iso,
            already_claimed=False,
            message="Certificate claimed successfully!"
        )
    except DuplicateKeyError:
        # Race condition or existing compound key caught by index
        existing_cert = await db.certificates.find_one({
            "event_id": event_id,
            "device_token": device_token
        })
        if existing_cert:
            return ClaimResponse(
                certificate_number=existing_cert["certificate_number"],
                name=existing_cert["name"],
                event_name=event_name,
                created_at=existing_cert["created_at"],
                already_claimed=True,
                message="A certificate has already been claimed using this browser device."
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Duplicate certificate claim detected."
            )

@router.get("/events/{event_id}/registrations", response_model=RegistrationsResponse)
async def get_registrations(event_id: str):
    db = get_database()
    
    event = await db.events.find_one({"_id": event_id})
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event '{event_id}' not found."
        )
    
    event_name = event.get("name", "ACM Event")

    cursor = db.certificates.find({"event_id": event_id}).sort("created_at", -1)
    certs = await cursor.to_list(length=1000)

    registrations = [
        RegistrationItem(
            certificate_number=c["certificate_number"],
            name=c["name"],
            device_token=c["device_token"],
            created_at=c["created_at"]
        ) for c in certs
    ]

    return RegistrationsResponse(
        event_id=event_id,
        event_name=event_name,
        total_issued=len(registrations),
        registrations=registrations
    )
