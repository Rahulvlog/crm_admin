# views.py

from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import TasksRecord
from .serializers import TasksRecordSerializer


@api_view(['GET', 'POST', 'PUT', 'DELETE'])
def tasks_record_api(request, id=None):

    # =========================
    # GET API
    # =========================
    if request.method == 'GET':

        # Single Data
        if id:

            try:
                task = TasksRecord.objects.get(id=id)

            except TasksRecord.DoesNotExist:
                return Response({
                    "status": False,
                    "message": "Task not found"
                })

            serializer = TasksRecordSerializer(task)

            return Response({
                "status": True,
                "data": serializer.data
            })

        # All Data
        tasks = TasksRecord.objects.all().order_by('-id')

        serializer = TasksRecordSerializer(tasks, many=True)

        return Response({
            "status": True,
            "data": serializer.data
        })

    # =========================
    # POST API
    # =========================
    elif request.method == 'POST':

        serializer = TasksRecordSerializer(data=request.data)

        if serializer.is_valid():

            serializer.save()

            return Response({
                "status": True,
                "message": "Task created successfully",
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
            task = TasksRecord.objects.get(id=id)

        except TasksRecord.DoesNotExist:
            return Response({
                "status": False,
                "message": "Task not found"
            })

        serializer = TasksRecordSerializer(
            task,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            serializer.save()

            return Response({
                "status": True,
                "message": "Task updated successfully",
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
            task = TasksRecord.objects.get(id=id)

        except TasksRecord.DoesNotExist:
            return Response({
                "status": False,
                "message": "Task not found"
            })

        task.delete()

        return Response({
            "status": True,
            "message": "Task deleted successfully"
        })