# views.py

from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import AppNotificationHistory
from .serializers import AppNotificationHistorySerializer


@api_view(['GET', 'POST', 'PUT', 'DELETE'])
def app_notification_history_api(request, id=None):

    # =========================
    # GET API
    # =========================
    if request.method == 'GET':

        # Single Data
        if id:

            try:
                notification = AppNotificationHistory.objects.get(id=id)

            except AppNotificationHistory.DoesNotExist:
                return Response({
                    "status": False,
                    "message": "Notification not found"
                })

            serializer = AppNotificationHistorySerializer(notification)

            return Response({
                "status": True,
                "data": serializer.data
            })

        # All Data
        notifications = AppNotificationHistory.objects.all().order_by('-id')

        serializer = AppNotificationHistorySerializer(notifications, many=True)

        return Response({
            "status": True,
            "data": serializer.data
        })

    # =========================
    # POST API
    # =========================
    elif request.method == 'POST':

        serializer = AppNotificationHistorySerializer(data=request.data)

        if serializer.is_valid():

            serializer.save()

            return Response({
                "status": True,
                "message": "Notification created successfully",
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
            notification = AppNotificationHistory.objects.get(id=id)

        except AppNotificationHistory.DoesNotExist:
            return Response({
                "status": False,
                "message": "Notification not found"
            })

        serializer = AppNotificationHistorySerializer(
            notification,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            serializer.save()

            return Response({
                "status": True,
                "message": "Notification updated successfully",
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
            notification = AppNotificationHistory.objects.get(id=id)

        except AppNotificationHistory.DoesNotExist:
            return Response({
                "status": False,
                "message": "Notification not found"
            })

        notification.delete()

        return Response({
            "status": True,
            "message": "Notification deleted successfully"
        })