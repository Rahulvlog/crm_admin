import json
from pathlib import Path

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status


BODY_DATA_FILE_PATH = Path(__file__).resolve().parent.parent / "body_data.txt"


@api_view(["GET"])
def body_data_api(request):
    if not BODY_DATA_FILE_PATH.exists():
        return Response(
            {
                "status": False,
                "message": "body_data.txt file not found.",
            },
            status=status.HTTP_404_NOT_FOUND,
        )

    raw_body_data = BODY_DATA_FILE_PATH.read_text(encoding="utf-8")

    try:
        parsed_body_data = json.loads(raw_body_data)
    except json.JSONDecodeError:
        return Response(
            {
                "status": False,
                "message": "body_data.txt contains invalid JSON data.",
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return Response(
        {
            "status": True,
            "data": parsed_body_data,
        }
    )
