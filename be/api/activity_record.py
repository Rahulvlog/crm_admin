# views.py

from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import ActivityRecord
from .serializers import ActivityRecordSerializer, GetActivityRecordSerializer


@api_view(['GET', 'POST', 'PUT', 'DELETE'])
def activity_record_api(request, id=None):

    # =========================
    # GET API
    # =========================
    if request.method == 'GET':

        # Base queryset
        activities = ActivityRecord.objects.all()

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

        # All Data
        activities = activities.order_by('-id')

        serializer = GetActivityRecordSerializer(activities, many=True)

        return Response({
            "status": True,
            "data": serializer.data
        })

    # =========================
    # POST API
    # =========================
    elif request.method == 'POST':

        serializer = ActivityRecordSerializer(data=request.data)

        if serializer.is_valid():

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