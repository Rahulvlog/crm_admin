from rest_framework import status
from rest_framework.response import Response

from .models import AppUsers, UserSession, SubAdminStateAssignment


PRIVILEGED_ROLES = {"manager", "sub_admin"}
USER_ID_KEYS = (
    "user_id",
    "emp_id",
    "id",
    "manager_id",
    "sender_id",
)
HEADER_USER_ID_KEYS = (
    "x-user-id",
    "user-id",
    "x-userid",
    "userid",
)
META_USER_ID_KEYS = (
    "HTTP_X_USER_ID",
    "HTTP_USER_ID",
    "HTTP_X_USERID",
    "HTTP_USERID",
)
SESSION_TOKEN_KEYS = (
    "x-session-token",
    "session-token",
    "x-sessiontoken",
    "session_token",
)
META_SESSION_TOKEN_KEYS = (
    "HTTP_X_SESSION_TOKEN",
    "HTTP_SESSION_TOKEN",
    "HTTP_X_SESSIONTOKEN",
)


def _parse_user_id(value):
    if value in (None, "", "null"):
        return None

    try:
        parsed_value = int(value)
    except (TypeError, ValueError):
        return None

    if parsed_value <= 0:
        return None

    return parsed_value


def _get_actor_user_id(request):
    request_headers = getattr(request, "headers", {})
    for key in HEADER_USER_ID_KEYS:
        parsed_header_value = _parse_user_id(request_headers.get(key))
        if parsed_header_value:
            return parsed_header_value

    request_meta = getattr(request, "META", {})
    for key in META_USER_ID_KEYS:
        parsed_meta_value = _parse_user_id(request_meta.get(key))
        if parsed_meta_value:
            return parsed_meta_value

    return None


def _get_user_id_candidates(request, route_user_id=None, include_route_user_id=False):
    candidates = []

    if include_route_user_id:
        route_id = _parse_user_id(route_user_id)
        if route_id:
            candidates.append(route_id)

    for key in USER_ID_KEYS:
        data_value = request.data.get(key) if hasattr(request, "data") else None
        parsed_data_value = _parse_user_id(data_value)
        if parsed_data_value:
            candidates.append(parsed_data_value)

        query_value = request.query_params.get(key)
        parsed_query_value = _parse_user_id(query_value)
        if parsed_query_value:
            candidates.append(parsed_query_value)

    request_headers = getattr(request, "headers", {})
    for key in HEADER_USER_ID_KEYS:
        header_value = request_headers.get(key)
        parsed_header_value = _parse_user_id(header_value)
        if parsed_header_value:
            candidates.append(parsed_header_value)

    request_meta = getattr(request, "META", {})
    for key in META_USER_ID_KEYS:
        meta_value = request_meta.get(key)
        parsed_meta_value = _parse_user_id(meta_value)
        if parsed_meta_value:
            candidates.append(parsed_meta_value)

    deduped_candidates = []
    seen = set()

    for candidate in candidates:
        if candidate in seen:
            continue
        seen.add(candidate)
        deduped_candidates.append(candidate)

    return deduped_candidates


def _get_session_token(request):
    request_headers = getattr(request, "headers", {})
    for key in SESSION_TOKEN_KEYS:
        token = request_headers.get(key)
        if token:
            return str(token).strip()

    request_meta = getattr(request, "META", {})
    for key in META_SESSION_TOKEN_KEYS:
        token = request_meta.get(key)
        if token:
            return str(token).strip()

    if hasattr(request, "data"):
        for key in ("session_token", "x_session_token"):
            token = request.data.get(key)
            if token:
                return str(token).strip()

    query_token = request.query_params.get("session_token")
    if query_token:
        return str(query_token).strip()

    return None


def enforce_force_relogin(request, route_user_id=None, include_route_user_id=False):
    user_id_candidates = _get_user_id_candidates(
        request,
        route_user_id=route_user_id,
        include_route_user_id=include_route_user_id,
    )
    if not user_id_candidates:
        return None

    session_token = _get_session_token(request)

    for user_id in user_id_candidates:
        user = AppUsers.objects.filter(id=user_id).first()
        if not user:
            continue

        normalized_role = str(user.role_type).strip().lower()
        if normalized_role not in PRIVILEGED_ROLES:
            continue

        if not session_token:
            return Response(
                {
                    "status": False,
                    "message": "Session expired. Please login again.",
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )

        active_session = UserSession.objects.filter(
            user_id=user.id,
            session_token=session_token,
            is_active=True,
        ).first()
        if not active_session:
            return Response(
                {
                    "status": False,
                    "message": "Session expired. Please login again.",
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if user.password_changed_at and active_session.created_at <= user.password_changed_at:
            return Response(
                {
                    "status": False,
                    "message": "Session expired. Please login again.",
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if user.force_relogin:
            return Response(
                {
                    "status": False,
                    "message": "Session expired. Please login again.",
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )

    return None


def get_request_actor(request):
    actor_user_id = _get_actor_user_id(request)
    if not actor_user_id:
        return None

    return AppUsers.objects.filter(id=actor_user_id).first()


def get_sub_admin_assigned_state_ids(sub_admin_user_id):
    if not sub_admin_user_id:
        return []

    return list(
        SubAdminStateAssignment.objects.filter(sub_admin_id=sub_admin_user_id).values_list("state_id", flat=True)
    )
