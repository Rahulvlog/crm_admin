from rest_framework.decorators import api_view
from rest_framework.response import Response
import secrets

from .models import AppUsers, UserSession
from .serializers import GetAppUsersSerializer
from .session_guard import PRIVILEGED_ROLES


@api_view(['POST'])
def login_api(request):

    try:

        mobile_no = request.data.get('mobile_no')
        password = request.data.get('password')

        user = AppUsers.objects.filter(
            mobile_no=mobile_no,
            password=password,
            # status=1
        ).first()

        if user:
            normalized_role = str(user.role_type).strip().lower()

            if user.force_relogin:
                user.force_relogin = 0
                user.save(update_fields=['force_relogin'])

            serializer = GetAppUsersSerializer(user)

            response_data = {
                # "status": 1,
                "message": "Login successful",
                "data": serializer.data
            }

            if normalized_role in PRIVILEGED_ROLES:
                session_token = secrets.token_urlsafe(48)
                UserSession.objects.create(
                    user=user,
                    session_token=session_token,
                    is_active=True,
                )
                response_data["session_token"] = session_token

            return Response(response_data)

        return Response({
            "status": 0,
            "message": "Invalid mobile number or password"
        })

    except Exception as e:

        return Response({
            "status": 0,
            "error": str(e)
        })