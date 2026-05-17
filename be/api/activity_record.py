# views.py

from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import ActivityRecord
from .serializers import ActivityRecordSerializer


@api_view(['GET', 'POST', 'PUT', 'DELETE'])
def activity_record_api(request, id=None):

    # =========================
    # GET API
    # =========================
    if request.method == 'GET':

        # Single Data
        if id:

            try:
                activity = ActivityRecord.objects.get(id=id)

            except ActivityRecord.DoesNotExist:
                return Response({
                    "status": False,
                    "message": "Activity not found"
                })

            serializer = ActivityRecordSerializer(activity)

            return Response({
                "status": True,
                "data": serializer.data
            })

        # All Data
        activities = ActivityRecord.objects.all().order_by('-id')

        serializer = ActivityRecordSerializer(activities, many=True)

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