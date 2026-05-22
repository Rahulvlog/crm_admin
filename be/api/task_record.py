# views.py

from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import TasksRecord
from .serializers import TasksRecordSerializer, GetTasksRecordSerializer


@api_view(['GET', 'POST', 'PUT', 'DELETE'])
def tasks_record_api(request, id=None):

    # =========================
    # GET API
    # =========================
    if request.method == 'GET':

        # Base queryset
        tasks = TasksRecord.objects.all()

        # Query params
        emp_id = request.query_params.get('user_id', None)
        client_id = request.query_params.get('manager_id', None)
        dealer_name = request.query_params.get('dealer_id', None)
        project_id = request.query_params.get('project_id', None)

        # Apply filters if params exist
        if emp_id is not None:
            tasks = tasks.filter(emp_id=emp_id)

        if client_id is not None:
            tasks = tasks.filter(client_id=client_id)

        if dealer_name is not None:
            tasks = tasks.filter(dealer_name=dealer_name)

        if project_id is not None:
            tasks = tasks.filter(project_id=project_id)

        # Single Data
        if id:
            try:
                task = tasks.get(id=id)

            except TasksRecord.DoesNotExist:
                return Response({
                    "status": False,
                    "message": "Task not found"
                })

            serializer = GetTasksRecordSerializer(task)

            return Response({
                "status": True,
                "data": serializer.data
            })

        # All Data
        tasks = tasks.order_by('-id')

        serializer = GetTasksRecordSerializer(tasks, many=True)

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