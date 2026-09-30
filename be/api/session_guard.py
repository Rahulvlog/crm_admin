from rest_framework import status
from rest_framework.response import Response

from .models import AppUsers


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


def _get_user_id_candidates(request, route_user_id=None):
    candidates = []

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


def enforce_force_relogin(request, route_user_id=None):
    user_id_candidates = _get_user_id_candidates(request, route_user_id=route_user_id)

    for user_id in user_id_candidates:
        user = AppUsers.objects.filter(id=user_id).first()
        if not user:
            continue

        normalized_role = str(user.role_type).strip().lower()
        if normalized_role in PRIVILEGED_ROLES and user.force_relogin:
            return Response(
                {
                    "status": False,
                    "message": "Session expired. Please login again.",
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )

    return None
