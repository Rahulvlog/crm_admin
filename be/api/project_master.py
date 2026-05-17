# views.py

from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import ProjectMaster
from .serializers import ProjectMasterSerializer


@api_view(['GET', 'POST', 'PUT', 'DELETE'])
def project_master_api(request, id=None):

    # =========================
    # GET API
    # =========================
    if request.method == 'GET':

        # Single Data
        if id:

            try:
                project = ProjectMaster.objects.get(id=id)

            except ProjectMaster.DoesNotExist:
                return Response({
                    "status": False,
                    "message": "Project not found"
                })

            serializer = ProjectMasterSerializer(project)

            return Response({
                "status": True,
                "data": serializer.data
            })

        # All Data
        projects = ProjectMaster.objects.all().order_by('-id')

        serializer = ProjectMasterSerializer(projects, many=True)

        return Response({
            "status": True,
            "data": serializer.data
        })

    # =========================
    # POST API
    # =========================
    elif request.method == 'POST':

        serializer = ProjectMasterSerializer(data=request.data)

        if serializer.is_valid():

            serializer.save()

            return Response({
                "status": True,
                "message": "Project created successfully",
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
            project = ProjectMaster.objects.get(id=id)

        except ProjectMaster.DoesNotExist:
            return Response({
                "status": False,
                "message": "Project not found"
            })

        serializer = ProjectMasterSerializer(
            project,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            serializer.save()

            return Response({
                "status": True,
                "message": "Project updated successfully",
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
            project = ProjectMaster.objects.get(id=id)

        except ProjectMaster.DoesNotExist:
            return Response({
                "status": False,
                "message": "Project not found"
            })

        project.delete()

        return Response({
            "status": True,
            "message": "Project deleted successfully"
        })