# views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import City
from .serializers import CitySerializer


@api_view(['GET', 'POST'])
def city_list_create(request):
    """
    GET  : Fetch all cities
    POST : Create a new city
    """
    if request.method == 'GET':
        cities = City.objects.select_related('state').all().order_by('-id')
        serializer = CitySerializer(cities, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = CitySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {
                    "message": "City created successfully.",
                    "data": serializer.data
                },
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
def city_detail(request, pk):
    """
    GET    : Retrieve single city
    PUT    : Update city
    DELETE : Delete city
    """
    try:
        city = City.objects.get(pk=pk)
    except City.DoesNotExist:
        return Response(
            {"error": "City not found."},
            status=status.HTTP_404_NOT_FOUND
        )

    if request.method == 'GET':
        serializer = CitySerializer(city)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = CitySerializer(city, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {
                    "message": "City updated successfully.",
                    "data": serializer.data
                }
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        city.delete()
        return Response(
            {"message": "City deleted successfully."},
            status=status.HTTP_204_NO_CONTENT
        )