# views.py

from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import RoleMaster
from .serializers import RoleMasterSerializer


@api_view(['GET', 'POST', 'PUT', 'DELETE'])
def role_master_api(request, id=None):

    # =========================
    # GET API
    # =========================
    if request.method == 'GET':

        # Single Data
        if id:

            try:
                role = RoleMaster.objects.get(id=id)

            except RoleMaster.DoesNotExist:
                return Response({
                    "status": False,
                    "message": "Role not found"
                })

            serializer = RoleMasterSerializer(role)

            return Response({
                "status": True,
                "data": serializer.data
            })

        # All Data
        roles = RoleMaster.objects.all().order_by('-id')

        serializer = RoleMasterSerializer(roles, many=True)

        return Response({
            "status": True,
            "data": serializer.data
        })

    # =========================
    # POST API
    # =========================
    elif request.method == 'POST':

        serializer = RoleMasterSerializer(data=request.data)

        if serializer.is_valid():

            serializer.save()

            return Response({
                "status": True,
                "message": "Role created successfully",
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
            role = RoleMaster.objects.get(id=id)

        except RoleMaster.DoesNotExist:
            return Response({
                "status": False,
                "message": "Role not found"
            })

        serializer = RoleMasterSerializer(
            role,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            serializer.save()

            return Response({
                "status": True,
                "message": "Role updated successfully",
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
            role = RoleMaster.objects.get(id=id)

        except RoleMaster.DoesNotExist:
            return Response({
                "status": False,
                "message": "Role not found"
            })

        role.delete()

        return Response({
            "status": True,
            "message": "Role deleted successfully"
        })