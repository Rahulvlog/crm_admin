from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import AppUsers
from .serializers import AppUsersSerializer, GetAppUsersSerializer
from .session_guard import enforce_force_relogin, PRIVILEGED_ROLES


@api_view(['GET', 'POST', 'PUT', 'DELETE'])
def app_users_api(request, id=None):
    blocked_response = enforce_force_relogin(request, route_user_id=id)
    if blocked_response:
        return blocked_response

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

            serializer = GetAppUsersSerializer(user)

            return Response({
                "status": True,
                "data": serializer.data
            })

        # All Data
        users = AppUsers.objects.all()

        serializer = GetAppUsersSerializer(users, many=True)

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

        password_updated = (
            request.data.get('password') is not None
            and str(request.data.get('password')) != str(user.password)
        )

        serializer = AppUsersSerializer(
            user,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            updated_user = serializer.save()

            if password_updated:
                normalized_role = str(updated_user.role_type).strip().lower()
                if normalized_role in PRIVILEGED_ROLES:
                    updated_user.force_relogin = 1
                    updated_user.save(update_fields=['force_relogin'])

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