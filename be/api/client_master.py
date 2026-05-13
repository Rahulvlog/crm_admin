from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

from api.db import execute_query

@csrf_exempt
def client_api(request, id=None):

    # 🔹 GET
    if request.method == "GET":
        if id:
            data = execute_query(
                "SELECT * FROM client_master WHERE id=%s",
                [id],
                fetch_one=True
            )
            if data:
                return JsonResponse({"data": data})
            return JsonResponse({"message": "Not found"}, status=404)

        else:
            data = execute_query(
                "SELECT * FROM client_master",
                fetch_all=True
            )
            return JsonResponse({"data": data})

    # 🔹 POST
    elif request.method == "POST":
        body = json.loads(request.body)

        execute_query("""
            INSERT INTO client_master (client_name, contact_person, mobile_no, city)
            VALUES (%s, %s, %s, %s)
        """, [
            body.get("client_name"),
            body.get("contact_person"),
            body.get("mobile_no"),
            body.get("city"),
        ])

        return JsonResponse({"message": "Client added successfully"})

    # 🔹 PUT
    elif request.method == "PUT":
        if not id:
            return JsonResponse({"error": "ID required"}, status=400)

        body = json.loads(request.body)

        execute_query("""
            UPDATE client_master
            SET client_name=%s, contact_person=%s, mobile_no=%s, city=%s
            WHERE id=%s
        """, [
            body.get("client_name"),
            body.get("contact_person"),
            body.get("mobile_no"),
            body.get("city"),
            id
        ])

        return JsonResponse({"message": "Updated successfully"})

    # 🔹 DELETE
    elif request.method == "DELETE":
        if not id:
            return JsonResponse({"error": "ID required"}, status=400)

        execute_query(
            "DELETE FROM client_master WHERE id=%s",
            [id]
        )

        return JsonResponse({"message": "Deleted successfully"})

    return JsonResponse({"error": "Method not allowed"}, status=405)