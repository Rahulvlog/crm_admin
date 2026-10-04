from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.utils import timezone

from .models import AppUsers
from .models import UserSession
from .serializers import AppUsersSerializer, GetAppUsersSerializer
from .session_guard import (
    enforce_force_relogin,
    PRIVILEGED_ROLES,
    get_request_actor,
    get_sub_admin_assigned_state_ids,
)


@api_view(['GET', 'POST', 'PUT', 'DELETE'])
def app_users_api(request, id=None):
    blocked_response = enforce_force_relogin(request)
    if blocked_response:
        return blocked_response

    # =========================
    # GET API
    # =========================
    if request.method == 'GET':
        actor = get_request_actor(request)
        is_sub_admin = actor and str(actor.role_type).strip().lower() == "sub_admin"

        # Single Data
        if id:

            try:
                user = AppUsers.objects.get(id=id)

            except AppUsers.DoesNotExist:
                return Response({
                    "status": False,
                    "message": "User not found"
                })

            if is_sub_admin and str(user.role_type).strip().lower() == "manager":
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
        if is_sub_admin:
            users = users.exclude(role_type__iexact="Manager")

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
                    updated_user.password_changed_at = timezone.now()
                    updated_user.save(update_fields=['force_relogin', 'password_changed_at'])
                    UserSession.objects.filter(
                        user_id=updated_user.id,
                        is_active=True,
                    ).update(is_active=False)

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