# views.py

from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Setting
from .serializers import SettingMasterSerializer


@api_view(['GET', 'POST', 'PUT', 'DELETE'])
def settings_api(request, id=None):

    # =========================
    # GET API
    # =========================
    if request.method == 'GET':

        # Single Data
        if id:

            try:
                state = Setting.objects.get(id=id)

            except Setting.DoesNotExist:
                return Response({
                    "status": False,
                    "message": "State not found"
                })

            serializer = SettingMasterSerializer(state)

            return Response({
                "status": True,
                "data": serializer.data
            })

        # All Data
        states = Setting.objects.all().order_by('-id')

        serializer = SettingMasterSerializer(states, many=True)

        return Response({
            "status": True,
            "data": serializer.data
        })

    # =========================
    # POST API
    # =========================
    elif request.method == 'POST':

        serializer = SettingMasterSerializer(data=request.data)

        if serializer.is_valid():

            serializer.save()

            return Response({
                "status": True,
                "message": "State created successfully",
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
            state = Setting.objects.get(id=id)

        except Setting.DoesNotExist:
            return Response({
                "status": False,
                "message": "State not found"
            })

        serializer = SettingMasterSerializer(
            state,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            serializer.save()

            return Response({
                "status": True,
                "message": "State updated successfully",
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
            state = Setting.objects.get(id=id)

        except Setting.DoesNotExist:
            return Response({
                "status": False,
                "message": "State not found"
            })

        state.delete()

        return Response({
            "status": True,
            "message": "State deleted successfully"
        })
  