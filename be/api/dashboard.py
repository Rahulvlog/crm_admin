from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import AppUsers, TasksRecord, ActivityRecord


@api_view(['GET'])
def dashboard_api(request, id=None):

    data = {
        # Users
        "total_user": AppUsers.objects.count(),
        "total_dealer": AppUsers.objects.filter(role_type="Dealer").count(),
        "total_employee": AppUsers.objects.filter(role_type="User").count(),

        # Tasks
        "total_task": TasksRecord.objects.count(),
        "pending_task": TasksRecord.objects.filter(status=1).count(),
        "inprogress_task": TasksRecord.objects.filter(status=2).count(),
        "completed_task": TasksRecord.objects.filter(status=3).count(),

        # Activity Records
        "total_print": ActivityRecord.objects.count(),
        "pending_print": ActivityRecord.objects.filter(status=0).count(),
        "rejected_print": ActivityRecord.objects.filter(status=-1).count(),
        "completed_print": ActivityRecord.objects.filter(status=1).count(),
    }

    return Response({
        "status": True,
        "message": "Dashboard data fetched successfully.",
        "data": data
    })