# views.py

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.core.paginator import Paginator
from django.utils.dateparse import parse_datetime
from django.utils.timezone import is_naive, make_aware, get_current_timezone
from .models import ActivityRecord, TasksRecord
from .serializers import ActivityRecordSerializer, GetActivityRecordSerializer
from .session_guard import enforce_force_relogin, get_request_actor, get_actor_accessible_state_ids


def _parse_manual_datetime(value, field_name):
    if value in (None, ""):
        return None, None

    parsed_value = parse_datetime(str(value))
    if parsed_value is None:
        return None, f"Invalid datetime format for {field_name}. Use ISO format."

    if is_naive(parsed_value):
        parsed_value = make_aware(parsed_value, get_current_timezone())

    return parsed_value, None


def _extract_manual_activity_dates(payload):
    update_fields = {}

    created_date, created_error = _parse_manual_datetime(payload.get("created_date"), "created_date")
    if created_error:
        return None, created_error
    if created_date:
        update_fields["created_date"] = created_date

    updated_date, updated_error = _parse_manual_datetime(payload.get("updated_date"), "updated_date")
    if updated_error:
        return None, updated_error
    if updated_date:
        update_fields["updated_date"] = updated_date

    return update_fields, None


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
            manual_dates, manual_date_error = _extract_manual_activity_dates(request.data)
            if manual_date_error:
                return Response({
                    "status": False,
                    "message": manual_date_error
                }, status=status.HTTP_400_BAD_REQUEST)

            task_id = serializer.validated_data.get("task_id")
            TasksRecord.objects.filter(id=task_id).update(status=1)

            created_activity = serializer.save()
            if manual_dates:
                ActivityRecord.objects.filter(id=created_activity.id).update(**manual_dates)
                created_activity.refresh_from_db()

            

            return Response({
                "status": True,
                "message": "Activity created successfully",
                "data": ActivityRecordSerializer(created_activity).data
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
            manual_dates, manual_date_error = _extract_manual_activity_dates(request.data)
            if manual_date_error:
                return Response({
                    "status": False,
                    "message": manual_date_error
                }, status=status.HTTP_400_BAD_REQUEST)

            updated_activity = serializer.save()
            if manual_dates:
                ActivityRecord.objects.filter(id=updated_activity.id).update(**manual_dates)
                updated_activity.refresh_from_db()

            return Response({
                "status": True,
                "message": "Activity updated successfully",
                "data": ActivityRecordSerializer(updated_activity).data
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