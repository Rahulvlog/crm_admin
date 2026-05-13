from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import AppUsers
from .serializers import AppUsersSerializer


@api_view(['GET', 'POST', 'PUT', 'DELETE'])
def app_users_api(request, id=None):

    # =========================
    # GET API
    # =========================
    if request.method == 'GET':

        # Single Data
        if id:

            try:
                user = AppUsers.objects.get(id=id)

            except AppUsers.DoesNotExist:
                return Response({
                    "status": False,
                    "message": "User not found"
                })

            serializer = AppUsersSerializer(user)

            return Response({
                "status": True,
                "data": serializer.data
            })

        # All Data
        users = AppUsers.objects.all()

        serializer = AppUsersSerializer(users, many=True)

        return Response({
            "status": True,
            "data": serializer.data
        })

    # =========================
    # POST API
    # =========================
    elif request.method == 'POST':

        serializer = AppUsersSerializer(data=request.data)

        if serializer.is_valid():

            serializer.save()

            return Response({
                "status": True,
                "message": "User created successfully",
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
            user = AppUsers.objects.get(id=id)

        except AppUsers.DoesNotExist:
            return Response({
                "status": False,
                "message": "User not found"
            })

        serializer = AppUsersSerializer(
            user,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            serializer.save()

            return Response({
                "status": True,
                "message": "User updated successfully",
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
            user = AppUsers.objects.get(id=id)

        except AppUsers.DoesNotExist:
            return Response({
                "status": False,
                "message": "User not found"
            })

        user.delete()

        return Response({
            "status": True,
            "message": "User deleted successfully"
        })