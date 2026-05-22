from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import AppUsers
from .serializers import AppUsersSerializer


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

            serializer = AppUsersSerializer(user)

            return Response({
                # "status": 1,
                "message": "Login successful",
                "data": serializer.data
            })

        return Response({
            "status": 0,
            "message": "Invalid mobile number or password"
        })

    except Exception as e:

        return Response({
            "status": 0,
            "error": str(e)
        })