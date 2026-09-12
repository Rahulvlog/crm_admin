import os
import json
import ast

from django.conf import settings
from django.core.files.storage import FileSystemStorage

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .models import ActivityRecord


@api_view(["PUT"])
def replace_image(request):
    try:
        print_id = request.data.get("print_id")
        image_name = request.data.get("image_name")
        new_image = request.FILES.get("replace_photo")

        if not all([print_id, image_name, new_image]):
            return Response(
                {
                    "status": False,
                    "message": "print_id, image_name and replace_photo are required"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        activity = ActivityRecord.objects.get(id=print_id)

        # Get photo data
        photo_data = activity.photo

        if not photo_data:
            return Response(
                {
                    "status": False,
                    "message": "No images found"
                },
                status=status.HTTP_404_NOT_FOUND
            )

        # Convert photo field into Python list
        try:
            photos = json.loads(photo_data)
        except json.JSONDecodeError:
            try:
                photos = ast.literal_eval(photo_data)
            except (ValueError, SyntaxError):
                return Response(
                    {
                        "status": False,
                        "message": "Invalid photo data stored in database",
                        "photo_data": str(photo_data)
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

        if not isinstance(photos, list):
            return Response(
                {
                    "status": False,
                    "message": "Photo data must be a list"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Find image
        index = next(
            (
                i for i, img in enumerate(photos)
                if image_name in str(img)
            ),
            None
        )

        if index is None:
            return Response(
                {
                    "status": False,
                    "message": "Image not found"
                },
                status=status.HTTP_404_NOT_FOUND
            )

        old_image_url = photos[index]

        # Extract folder
        try:
            folder_name = old_image_url.split("/uploads/")[1].split("/")[0]
        except Exception:
            return Response(
                {
                    "status": False,
                    "message": "Invalid image path"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        upload_path = os.path.join(
            settings.MEDIA_ROOT,
            "uploads",
            folder_name
        )

        os.makedirs(upload_path, exist_ok=True)

        # Delete old image
        old_filename = old_image_url.split("/")[-1]
        old_file_path = os.path.join(
            upload_path,
            old_filename
        )

        if os.path.exists(old_file_path):
            os.remove(old_file_path)

        # Save new image
        fs = FileSystemStorage(location=upload_path)

        filename = fs.save(
            new_image.name,
            new_image
        )

        new_url = request.build_absolute_uri(
            f"{settings.MEDIA_URL}uploads/{folder_name}/{filename}"
        )

        # Replace URL
        photos[index] = new_url

        # IMPORTANT: Always save valid JSON
        activity.photo = json.dumps(photos)
        activity.save(update_fields=["photo"])

        return Response(
            {
                "status": True,
                "message": "Image replaced successfully",
                "image_url": new_url,
                "photos": photos
            },
            status=status.HTTP_200_OK
        )

    except ActivityRecord.DoesNotExist:
        return Response(
            {
                "status": False,
                "message": "Activity record not found"
            },
            status=status.HTTP_404_NOT_FOUND
        )

    except Exception as e:
        return Response(
            {
                "status": False,
                "message": str(e)
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )