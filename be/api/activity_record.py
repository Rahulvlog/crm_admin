# views.py

from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.core.paginator import Paginator
from .models import ActivityRecord, TasksRecord
from .serializers import ActivityRecordSerializer, GetActivityRecordSerializer
from .session_guard import enforce_force_relogin, get_request_actor, get_actor_accessible_state_ids


@api_view(['GET', 'POST', 'PUT', 'DELETE'])
def activity_record_api(request, id=None):
    blocked_response = enforce_force_relogin(request, route_user_id=id)
    if blocked_response:
        return blocked_response

    # =========================
    # GET API
    # =========================
    if request.method == 'GET':

        # Base queryset
        activities = ActivityRecord.objects.all()
        actor = get_request_actor(request)
        accessible_state_ids = get_actor_accessible_state_ids(actor)
        if accessible_state_ids is not None:
            assigned_task_ids = TasksRecord.objects.filter(
                state__in=accessible_state_ids
            ).values_list('id', flat=True)
            activities = activities.filter(task_id__in=assigned_task_ids)

        # Query params
        emp_id = request.query_params.get('user_id', None)
        task_id = request.query_params.get('task_id', None)
        dealer_id = request.query_params.get('dealer_id', None)
        project_id = request.query_params.get('project_id', None)

        # Apply filters if params exist
        if emp_id is not None:
            activities = activities.filter(emp_id=emp_id)

        if task_id is not None:
            activities = activities.filter(task_id=task_id)

        if dealer_id is not None:
            activities = activities.filter(dealer_id=dealer_id)

        if project_id is not None:
            activities = activities.filter(project_id=project_id)

        # Single Data
        if id:
            try:
                activity = activities.get(id=id)

            except ActivityRecord.DoesNotExist:
                return Response({
                    "status": False,
                    "message": "Activity not found"
                })

            serializer = GetActivityRecordSerializer(activity)

            return Response({
                "status": True,
                "data": serializer.data
            })

        # All Data (Paginated)
        activities = activities.order_by('-id')

        try:
            page = int(request.query_params.get('page', 1))
        except (TypeError, ValueError):
            page = 1

        try:
            page_size = int(request.query_params.get('page_size', 50))
        except (TypeError, ValueError):
            page_size = 50

        if page < 1:
            page = 1

        if page_size < 1:
            page_size = 50

        if page_size > 100:
            page_size = 100

        paginator = Paginator(activities, page_size)
        paginated_activities = paginator.get_page(page)

        serializer = GetActivityRecordSerializer(paginated_activities.object_list, many=True)

        return Response({
            "status": True,
            "data": serializer.data,
            "pagination": {
                "page": paginated_activities.number,
                "page_size": page_size,
                "total_pages": paginator.num_pages,
                "total_records": paginator.count,
                "has_next": paginated_activities.has_next(),
                "has_previous": paginated_activities.has_previous(),
            }
        })

    #
    # 
    #  =========================
    # POST API
    # =========================
    elif request.method == 'POST':

        serializer = ActivityRecordSerializer(data=request.data)

        if serializer.is_valid():
            task_id = serializer.validated_data.get("task_id")
            TasksRecord.objects.filter(id=task_id).update(status=1)

            serializer.save()

            

            return Response({
                "status": True,
                "message": "Activity created successfully",
                "data": serializer.data
            })

        return Response({
            "status": False,
            "errors": serializer.errors
        })

    # =========================
    # PUT API
    # =========================
    elif request.method == 'PUT':

        try:
            activity = ActivityRecord.objects.get(id=id)

        except ActivityRecord.DoesNotExist:
            return Response({
                "status": False,
                "message": "Activity not found"
            })

        serializer = ActivityRecordSerializer(
            activity,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            serializer.save()

            return Response({
                "status": True,
                "message": "Activity updated successfully",
                "data": serializer.data
            })

        return Response({
            "status": False,
            "errors": serializer.errors
        })

    # =========================
    # DELETE API
    # =========================
    elif request.method == 'DELETE':

        try:
            activity = ActivityRecord.objects.get(id=id)

        except ActivityRecord.DoesNotExist:
            return Response({
                "status": False,
                "message": "Activity not found"
            })

        activity.delete()

        return Response({
            "status": True,
            "message": "Activity deleted successfully"
        })