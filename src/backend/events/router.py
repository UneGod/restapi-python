from fastapi import APIRouter, HTTPException

import psycopg2

def connection_db():
    conn = psycopg2.connect(
    dbname="myapp",
    user="user",
    password="pass",
    host="localhost",
    port="5432"
    )

    return conn

router = APIRouter(
    prefix="/event"
)

@router.get("/")
async def getEvents():
    try:
        cur = connection_db().cursor()
        cur.execute('''
            SELECT 
            e.id,
            e.title,
            e.description,
            et.name as event_type,
            s.name as scale,
            e.start_date,
            e.end_date,
            l.name as location,
            e.status,
            t.full_name as responsible_teacher,
            e.estimated_budget,
            pc.name as participant_category,
            e.notes
        FROM event e
        LEFT JOIN event_type et ON e.event_type_id = et.id
        LEFT JOIN scale s ON e.scale_id = s.id
        LEFT JOIN location l ON e.location_id = l.id
        LEFT JOIN teacher t ON e.responsible_teacher_id = t.id
        LEFT JOIN participant_category pc ON e.participant_category_id = pc.id
        ORDER BY e.id;
        ''')
    except Exception as e:
        print(e)
        raise HTTPException(status_code=404, detail="Error with DataBase")
    return cur.fetchall()



@router.get("/{event_id}")
async def getOneEvent(event_id):
    cur = connection_db().cursor()
    cur.execute(f'''
    SELECT 
        e.id,
        e.title,
        e.description,
        et.name as event_type,
        s.name as scale,
        e.start_date,
        e.end_date,
        l.name as location,
        e.status,
        t.full_name as responsible_teacher,
        e.estimated_budget,
        pc.name as participant_category,
        e.notes
    FROM event e
    LEFT JOIN event_type et ON e.event_type_id = et.id
    LEFT JOIN scale s ON e.scale_id = s.id
    LEFT JOIN location l ON e.location_id = l.id
    LEFT JOIN teacher t ON e.responsible_teacher_id = t.id
    LEFT JOIN participant_category pc ON e.participant_category_id = pc.id
    WHERE e.id={event_id}
    ORDER BY e.id;
    ''')
    return cur.fetchone()

@router.get("/name/{event_name}")
def getOneEvent(event_name):
    cur = connection_db().cursor()
    cur.execute(f'''
    SELECT 
        e.id,
        e.title,
        e.description,
        et.name as event_type,
        s.name as scale,
        e.start_date,
        e.end_date,
        l.name as location,
        e.status,
        t.full_name as responsible_teacher,
        e.estimated_budget,
        pc.name as participant_category,
        e.notes
    FROM event e
    LEFT JOIN event_type et ON e.event_type_id = et.id
    LEFT JOIN scale s ON e.scale_id = s.id
    LEFT JOIN location l ON e.location_id = l.id
    LEFT JOIN teacher t ON e.responsible_teacher_id = t.id
    LEFT JOIN participant_category pc ON e.participant_category_id = pc.id
    WHERE e.title='{event_name}'
    ORDER BY e.id;
    ''')
    return cur.fetchall()

#@router.post("/add_event")
#def addEvent(name, description, user_name):
#    conn = connection_db()
#    conn.cursor().execute(f"INSERT INTO event (name, description, user_id) VALUES ('{name}', '{description}', (SELECT id FROM users WHERE name = '{user_name}'));")
#    conn.commit()
#    return {"Ok": True}