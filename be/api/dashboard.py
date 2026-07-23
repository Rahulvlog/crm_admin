from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import AppUsers, TasksRecord, ActivityRecord
from django.db.models import Sum

from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def dashboard_api(request):

    user_id = request.GET.get("user_id")
    dealer_id = request.GET.get("dealer_id")
    manager_id = request.GET.get("manager_id")

    tasks = TasksRecord.objects.all()
    activities = ActivityRecord.objects.all()

    # Filter by Employee
    if user_id:
        tasks = tasks.filter(emp_id=user_id)
        activities = activities.filter(emp_id=user_id)

    # Filter by Dealer
    if dealer_id:
        tasks = tasks.filter(dealer_name=dealer_id)   # dealer_name stores dealer_id
        activities = activities.filter(dealer_id=dealer_id)

    if manager_id:
        try:
            tasks = tasks.filter(client_id=manager_id)
            task_ids = tasks.values_list("task_id", flat=True)
            activities = activities.filter(task_id__in=task_ids)
        except Exception as e:
            print(f"Error: {e}")   # Optional: log the error
            pass
    
    total_print = tasks.aggregate(
        total=Sum("no_of_flex")
    )["total"] or 0

    # Activity count
    activity_count = activities.count()

    # Remaining / Pending prints
    pending_print = max(total_print - activity_count, 0)

    data = {
        # Users (Global)
        "total_user": AppUsers.objects.count(),
        "total_dealer": AppUsers.objects.filter(role_type="Dealer").count(),
        "total_employee": AppUsers.objects.filter(role_type="User").count(),

        # Tasks
        "total_task": tasks.count(),
        "pending_task": tasks.filter(status=0).count(),
        "inprogress_task": tasks.filter(status=1).count(),
        "completed_task": tasks.filter(status=2).count(),

        # Activity
        "total_print": total_print,
        "pending_print": pending_print,
        "installed_print": activities.filter(status=0).count(),
        "rejected_print": activities.filter(status=-1).count(),
        "completed_print": activities.filter(status=1).count(),
    }

    return Response({
        "status": True,
        "message": "Dashboard data fetched successfully.",
        "data": data
    })