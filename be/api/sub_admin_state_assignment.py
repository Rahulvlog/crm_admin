from django.db import transaction
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import AppUsers, StateMaster, SubAdminStateAssignment
from .serializers import StateMasterSerializer, GetAppUsersSerializer
from .session_guard import enforce_force_relogin, get_request_actor


def _manager_guard(request):
    blocked_response = enforce_force_relogin(request)
    if blocked_response:
        return blocked_response

    actor = get_request_actor(request)
    if not actor:
        return Response({
            "status": False,
            "message": "x-user-id header is required."
        }, status=401)

    if str(actor.role_type).strip().lower() != "manager":
        return Response({
            "status": False,
            "message": "Only manager can assign states to sub admin."
        }, status=403)

    return None


@api_view(['GET', 'POST', 'PUT', 'DELETE'])
def sub_admin_state_assignment_api(request):
    guard_response = _manager_guard(request)
    if guard_response:
        return guard_response

    if request.method == 'GET':
        sub_admin_id = request.query_params.get('sub_admin_id')
        assignments = SubAdminStateAssignment.objects.select_related('sub_admin', 'state').all().order_by('-id')

        if sub_admin_id:
            assignments = assignments.filter(sub_admin_id=sub_admin_id)

        data = []
        for assignment in assignments:
            data.append({
                "id": assignment.id,
                "sub_admin_id": assignment.sub_admin_id,
                "sub_admin": GetAppUsersSerializer(assignment.sub_admin).data,
                "state_id": assignment.state_id,
                "state": StateMasterSerializer(assignment.state).data,
                "assigned_by": assignment.assigned_by,
                "created_at": assignment.created_at,
                "updated_at": assignment.updated_at,
            })

        return Response({
            "status": True,
            "data": data
        })

    request_data = request.data
    sub_admin_id = request_data.get('sub_admin_id')
    state_ids = request_data.get('state_ids', [])

    sub_admin = AppUsers.objects.filter(id=sub_admin_id).first()
    if not sub_admin:
        return Response({
            "status": False,
            "message": "Sub admin user not found."
        }, status=400)

    if str(sub_admin.role_type).strip().lower() != "sub_admin":
        return Response({
            "status": False,
            "message": "Selected user is not sub admin."
        }, status=400)

    if request.method in ['POST', 'PUT']:
        if not isinstance(state_ids, list):
            return Response({
                "status": False,
                "message": "state_ids must be a list."
            }, status=400)

        normalized_state_ids = []
        for state_id in state_ids:
            try:
                normalized_state_ids.append(int(state_id))
            except (TypeError, ValueError):
                return Response({
                    "status": False,
                    "message": "state_ids must contain valid integers."
                }, status=400)

        available_state_ids = set(
            StateMaster.objects.filter(id__in=normalized_state_ids).values_list('id', flat=True)
        )
        missing_state_ids = [item for item in normalized_state_ids if item not in available_state_ids]
        if missing_state_ids:
            return Response({
                "status": False,
                "message": "Some states are invalid.",
                "invalid_state_ids": missing_state_ids
            }, status=400)

        actor = get_request_actor(request)
        actor_id = actor.id if actor else 0

        with transaction.atomic():
            SubAdminStateAssignment.objects.filter(sub_admin_id=sub_admin.id).exclude(
                state_id__in=normalized_state_ids
            ).delete()

            existing_state_ids = set(
                SubAdminStateAssignment.objects.filter(
                    sub_admin_id=sub_admin.id,
                    state_id__in=normalized_state_ids
                ).values_list('state_id', flat=True)
            )

            new_assignments = []
            for state_id in normalized_state_ids:
                if state_id in existing_state_ids:
                    continue
                new_assignments.append(
                    SubAdminStateAssignment(
                        sub_admin_id=sub_admin.id,
                        state_id=state_id,
                        assigned_by=actor_id,
                    )
                )

            if new_assignments:
                SubAdminStateAssignment.objects.bulk_create(new_assignments)

        return Response({
            "status": True,
            "message": "States assigned successfully."
        })

    if request.method == 'DELETE':
        deleted_count, _ = SubAdminStateAssignment.objects.filter(sub_admin_id=sub_admin.id).delete()
        return Response({
            "status": True,
            "message": "State assignments removed successfully.",
            "deleted_rows": deleted_count
        })

    return Response({"status": False, "message": "Method not allowed."}, status=405)
