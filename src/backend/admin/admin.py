# admin.py или добавьте в main.py
from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
import psycopg2  # или ваша ORM

router = APIRouter(prefix="/admin", tags=["admin"])

def connection_db():
    conn = psycopg2.connect(
    dbname="myapp",
    user="user",
    password="pass",
    host="localhost",
    port="5432"
    )

    return conn

@router.get("/stats")
async def get_admin_stats():
    cur = connection_db().cursor()
    cur.execute("""
        SELECT COUNT(*)
        FROM information_schema.tables
        WHERE table_type = 'BASE TABLE'
        AND table_schema NOT IN ('pg_catalog', 'information_schema');
    """)
    num_tables = cur.fetchone()[0]
    cur.execute('SELECT COUNT(*) FROM event;')
    nums_event = cur.fetchall()
    cur.execute('SELECT COUNT(*) FROM teacher;')
    nums_teacher = cur.fetchall()
    cur.execute('SELECT COUNT(*) FROM location;')
    nums_location = cur.fetchall()
    cur.execute('SELECT COUNT(*) FROM event_type;')
    nums_event_type = cur.fetchall()
    cur.execute('SELECT COUNT(*) FROM scale;')
    nums_scale = cur.fetchall()
    cur.execute('SELECT COUNT(*) FROM participant_category;')
    nums_pc = cur.fetchall()
    cur.execute('SELECT COUNT(*) FROM users;')
    nums_users = cur.fetchall()
    return {
        "tableCount": num_tables,
        "eventCount": nums_event[0][0],
        "teacherCount": nums_teacher[0][0],
        "locationCount": nums_location[0][0],
        "eventTypeCount": nums_event_type[0][0],
        "scaleCount": nums_scale[0][0],
        "participantCategoryCount": nums_pc[0][0],
        "userCount": nums_users[0][0],
    }

@router.get("/tables/{table_name}")
async def get_table_data(table_name: str):
    cur = connection_db().cursor()
    if table_name == "events":
        cur.execute('SELECT * FROM event;')
        return cur.fetchall()
    elif table_name == "event_type":
        cur.execute('SELECT * FROM event_type;')
        return cur.fetchall()
    elif table_name == "scale":
        cur.execute('SELECT * FROM scale;')
        return cur.fetchall()
    elif table_name == "teacher":
        cur.execute('SELECT * FROM teacher;')
        return cur.fetchall()
    elif table_name == "location":
        cur.execute('SELECT * FROM location;')
        return cur.fetchall()
    elif table_name == "participant_category":
        cur.execute('SELECT * FROM participant_category;')
        return cur.fetchall()
    # ... и так для всех таблиц

@router.delete("/tables/{table_name}/{record_id}")
async def delete_table_record(table_name: str, record_id: int):
    # Реализуйте логику удаления записи
    try:
        conn = connection_db()
        conn.cursor().execute(
                f'''
                    DELETE FROM {table_name}
                    WHERE id={record_id};
                '''
            )
        conn.commit()
        return {"Ok": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))