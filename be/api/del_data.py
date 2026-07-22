from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import TasksRecord, ActivityRecord, ProjectMaster

@api_view(['DELETE'])
def delete_all_records(request):
    try:
        # Delete child table first (if foreign keys exist)
        activity_count, _ = ActivityRecord.objects.all().delete()
        task_count, _ = TasksRecord.objects.all().delete()
        project_count, _ = ProjectMaster.objects.all().delete()

        return Response({
            "status": True,
            "message": "All records deleted successfully.",
            "deleted_records": {
                "activities": activity_count,
                "tasks": task_count,
                "projects": project_count
            }
        })

    except Exception as e:
        return Response({
            "status": False,
            "message": str(e)
        }, status=500)