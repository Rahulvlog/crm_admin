# views.py

from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import StateMaster
from .serializers import StateMasterSerializer
from .session_guard import enforce_force_relogin, get_request_actor, get_sub_admin_assigned_state_ids


@api_view(['GET', 'POST', 'PUT', 'DELETE'])
def state_master_api(request, id=None):
    blocked_response = enforce_force_relogin(request, route_user_id=id)
    if blocked_response:
        return blocked_response

    # =========================
    # GET API
    # =========================
    if request.method == 'GET':
        actor = get_request_actor(request)
        is_sub_admin = actor and str(actor.role_type).strip().lower() == "sub_admin"
        assigned_state_ids = get_sub_admin_assigned_state_ids(actor.id) if is_sub_admin else []

        # Single Data
        if id:

            try:
                state = StateMaster.objects.get(id=id)

            except StateMaster.DoesNotExist:
                return Response({
                    "status": False,
                    "message": "State not found"
                })

            if is_sub_admin and state.id not in assigned_state_ids:
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
        states = StateMaster.objects.all()
        if is_sub_admin:
            states = states.filter(id__in=assigned_state_ids)
        states = states.order_by('-id')

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
from .serializers import CityMasterSerializer, GetCityMasterSerializer


@api_view(['GET', 'POST', 'PUT', 'DELETE'])
def city_master_api(request, id=None):
    blocked_response = enforce_force_relogin(request, route_user_id=id)
    if blocked_response:
        return blocked_response

    # =========================
    # GET API
    # =========================
    if request.method == 'GET':
        actor = get_request_actor(request)
        is_sub_admin = actor and str(actor.role_type).strip().lower() == "sub_admin"
        assigned_state_ids = get_sub_admin_assigned_state_ids(actor.id) if is_sub_admin else []

        # Single Data
        if id:

            try:
                city = CityMaster.objects.get(id=id)

            except CityMaster.DoesNotExist:
                return Response({
                    "status": False,
                    "message": "City not found"
                })

            if is_sub_admin and city.state_id not in assigned_state_ids:
                return Response({
                    "status": False,
                    "message": "City not found"
                })

            serializer = GetCityMasterSerializer(city)

            return Response({
                "status": True,
                "data": serializer.data
            })

        # All Data
        cities = CityMaster.objects.all()
        if is_sub_admin:
            cities = cities.filter(state_id__in=assigned_state_ids)
        cities = cities.order_by('-id')

        serializer = GetCityMasterSerializer(cities, many=True)

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