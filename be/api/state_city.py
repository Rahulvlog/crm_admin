# views.py

from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import StateMaster
from .serializers import StateMasterSerializer


@api_view(['GET', 'POST', 'PUT', 'DELETE'])
def state_master_api(request, id=None):

    # =========================
    # GET API
    # =========================
    if request.method == 'GET':

        # Single Data
        if id:

            try:
                state = StateMaster.objects.get(id=id)

            except StateMaster.DoesNotExist:
                return Response({
                    "status": False,
                    "message": "State not found"
                })

            serializer = StateMasterSerializer(state)

            return Response({
                "status": True,
                "data": serializer.data
            })

        # All Data
        states = StateMaster.objects.all().order_by('-id')

        serializer = StateMasterSerializer(states, many=True)

        return Response({
            "status": True,
            "data": serializer.data
        })

    # =========================
    # POST API
    # =========================
    elif request.method == 'POST':

        serializer = StateMasterSerializer(data=request.data)

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
            state = StateMaster.objects.get(id=id)

        except StateMaster.DoesNotExist:
            return Response({
                "status": False,
                "message": "State not found"
            })

        serializer = StateMasterSerializer(
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
            state = StateMaster.objects.get(id=id)

        except StateMaster.DoesNotExist:
            return Response({
                "status": False,
                "message": "State not found"
            })

        state.delete()

        return Response({
            "status": True,
            "message": "State deleted successfully"
        })
    
from .models import CityMaster
from .serializers import CityMasterSerializer


@api_view(['GET', 'POST', 'PUT', 'DELETE'])
def city_master_api(request, id=None):

    # =========================
    # GET API
    # =========================
    if request.method == 'GET':

        # Single Data
        if id:

            try:
                city = CityMaster.objects.get(id=id)

            except CityMaster.DoesNotExist:
                return Response({
                    "status": False,
                    "message": "City not found"
                })

            serializer = CityMasterSerializer(city)

            return Response({
                "status": True,
                "data": serializer.data
            })

        # All Data
        cities = CityMaster.objects.all().order_by('-id')

        serializer = CityMasterSerializer(cities, many=True)

        return Response({
            "status": True,
            "data": serializer.data
        })

    # =========================
    # POST API
    # =========================
    elif request.method == 'POST':

        serializer = CityMasterSerializer(data=request.data)

        if serializer.is_valid():

            serializer.save()

            return Response({
                "status": True,
                "message": "City created successfully",
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
            city = CityMaster.objects.get(id=id)

        except CityMaster.DoesNotExist:
            return Response({
                "status": False,
                "message": "City not found"
            })

        serializer = CityMasterSerializer(
            city,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            serializer.save()

            return Response({
                "status": True,
                "message": "City updated successfully",
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
            city = CityMaster.objects.get(id=id)

        except CityMaster.DoesNotExist:
            return Response({
                "status": False,
                "message": "City not found"
            })

        city.delete()

        return Response({
            "status": True,
            "message": "City deleted successfully"
        })