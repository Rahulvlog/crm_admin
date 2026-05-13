from django.db import connection

def execute_query(query, params=None, fetch_one=False, fetch_all=False):
    with connection.cursor() as cursor:
        cursor.execute(query, params or [])

        if fetch_one:
            row = cursor.fetchone()
            if row:
                columns = [col[0] for col in cursor.description]
                return dict(zip(columns, row))
            return None

        if fetch_all:
            rows = cursor.fetchall()
            columns = [col[0] for col in cursor.description]
            return [dict(zip(columns, row)) for row in rows]

        return None