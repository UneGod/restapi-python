from fastapi import APIRouter
import psycopg2


router = APIRouter(prefix="/reference", tags=["reference"])

def connection_db():
    conn = psycopg2.connect(
    dbname="myapp",
    user="user",
    password="pass",
    host="localhost",
    port="5432"
    )

    return conn

cur = connection_db().cursor()

cur.execute("select * from event_type;")
event_types = cur.fetchall()

cur.execute("select * from scale;")
scales = cur.fetchall()

cur.execute("select * from location;")
locations = cur.fetchall()

cur.execute("select * from teacher;")
teachers = cur.fetchall()

cur.execute("select * from participant_category;")
participant_categories = cur.fetchall()

@router.get("/event_types")
async def get_event_types():
    return event_types

@router.get("/scales")
async def get_scales():
    return scales

@router.get("/locations")
async def get_locations():
    return locations

@router.get("/teachers")
async def get_teachers():
    return teachers

@router.get("/participant_categories")
async def get_participant_categories():
    return participant_categories