import os
import json

from django.conf import settings
from django.core.files.storage import FileSystemStorage

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .models import ActivityRecord


@api_view(["PUT"])
def replace_image(request):
    try:
        # ---------------------------------------------------------
        # 1. Get request data
        # ---------------------------------------------------------
        print_id = request.data.get("print_id")
        image_name = request.data.get("image_name")
        new_image = request.FILES.get("replace_photo")

        if not print_id or not image_name or not new_image:
            return Response(
                {
                    "status": False,
                    "message": "print_id, image_name and replace_photo are required"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # ---------------------------------------------------------
        # 2. Get Activity Record
        # ---------------------------------------------------------
        try:
            activity = ActivityRecord.objects.get(id=print_id)

        except ActivityRecord.DoesNotExist:
            return Response(
                {
                    "status": False,
                    "message": "Activity record not found"
                },
                status=status.HTTP_404_NOT_FOUND
            )

        # ---------------------------------------------------------
        # 3. Get photo data from database
        # ---------------------------------------------------------
        photo_data = activity.photo

        if not photo_data:
            return Response(
                {
                    "status": False,
                    "message": "No images found"
                },
                status=status.HTTP_404_NOT_FOUND
            )

        # ---------------------------------------------------------
        # 4. Convert photo data into Python list
        #
        # Supports:
        #
        # Proper JSON:
        # ["http://url1", "http://url2"]
        #
        # Old format:
        # [http://url1, http://url2]
        # ---------------------------------------------------------
        try:

            # First try proper JSON
            photos = json.loads(photo_data)

        except (json.JSONDecodeError, TypeError):

            # Handle old database format
            photo_data = str(photo_data).strip()

            if (
                photo_data.startswith("[")
                and photo_data.endswith("]")
            ):

                # Remove [ and ]
                photo_data = photo_data[1:-1].strip()

                if photo_data:

                    # Split URLs by comma
                    photos = [
                        item.strip()
                        for item in photo_data.split(",")
                        if item.strip()
                    ]

                else:
                    photos = []

            else:
                return Response(
                    {
                        "status": False,
                        "message": "Invalid photo data stored in database",
                        "photo_data": str(photo_data)
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

        # ---------------------------------------------------------
        # 5. Make sure photos is a list
        # ---------------------------------------------------------
        if not isinstance(photos, list):

            return Response(
                {
                    "status": False,
                    "message": "Photo data is not a valid list"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if not photos:

            return Response(
                {
                    "status": False,
                    "message": "No images found"
                },
                status=status.HTTP_404_NOT_FOUND
            )

        # ---------------------------------------------------------
        # 6. Find image which needs to be replaced
        # ---------------------------------------------------------
        index = next(
            (
                i
                for i, img in enumerate(photos)
                if image_name in str(img)
            ),
            None
        )

        if index is None:

            return Response(
                {
                    "status": False,
                    "message": "Image not found",
                    "requested_image": image_name,
                    "available_images": photos
                },
                status=status.HTTP_404_NOT_FOUND
            )

        # ---------------------------------------------------------
        # 7. Get old image URL
        # ---------------------------------------------------------
        old_image_url = str(photos[index])

        # ---------------------------------------------------------
        # 8. Extract folder name
        #
        # Example:
        #
        # http://72.61.229.236/media/uploads/
        # task_92_23.2401625_77.4396334/
        # watermarked_1787295402941.png
        #
        # folder_name =
        # task_92_23.2401625_77.4396334
        # ---------------------------------------------------------
        try:

            if "/uploads/" not in old_image_url:
                return Response(
                    {
                        "status": False,
                        "message": "Invalid image path",
                        "image_url": old_image_url
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            folder_name = (
                old_image_url
                .split("/uploads/", 1)[1]
                .split("/", 1)[0]
            )

        except Exception:

            return Response(
                {
                    "status": False,
                    "message": "Invalid image path",
                    "image_url": old_image_url
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # ---------------------------------------------------------
        # 9. Create upload folder path
        # ---------------------------------------------------------
        upload_path = os.path.join(
            settings.MEDIA_ROOT,
            "uploads",
            folder_name
        )

        os.makedirs(
            upload_path,
            exist_ok=True
        )

        # ---------------------------------------------------------
        # 10. Get old filename
        # ---------------------------------------------------------
        old_filename = old_image_url.rstrip("/").split("/")[-1]

        old_file_path = os.path.join(
            upload_path,
            old_filename
        )

        # ---------------------------------------------------------
        # 11. Delete old image
        # ---------------------------------------------------------
        if os.path.exists(old_file_path):

            try:
                os.remove(old_file_path)

            except Exception as e:

                return Response(
                    {
                        "status": False,
                        "message": "Unable to delete old image",
                        "error": str(e)
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        # ---------------------------------------------------------
        # 12. Save new image in SAME folder
        # ---------------------------------------------------------
        fs = FileSystemStorage(
            location=upload_path
        )

        filename = fs.save(
            new_image.name,
            new_image
        )

        # ---------------------------------------------------------
        # 13. Build new image URL
        # ---------------------------------------------------------
        new_url = request.build_absolute_uri(
            f"{settings.MEDIA_URL}"
            f"uploads/{folder_name}/{filename}"
        )

        # ---------------------------------------------------------
        # 14. Replace old URL with new URL
        # ---------------------------------------------------------
        photos[index] = new_url

        # ---------------------------------------------------------
        # 15. Save photos as VALID JSON
        #
        # This will also automatically fix your old database
        # format after the first successful replacement.
        # ---------------------------------------------------------
        activity.photo = json.dumps(
            photos,
            ensure_ascii=False
        )

        activity.save(
            update_fields=["photo"]
        )

        # ---------------------------------------------------------
        # 16. Return response
        # ---------------------------------------------------------
        return Response(
            {
                "status": True,
                "message": "Image replaced successfully",
                "old_image": old_image_url,
                "image_url": new_url,
                "photos": photos
            },
            status=status.HTTP_200_OK
        )

    # -------------------------------------------------------------
    # 17. JSON error
    # -------------------------------------------------------------
    except json.JSONDecodeError:

        return Response(
            {
                "status": False,
                "message": "Invalid photo JSON data"
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # -------------------------------------------------------------
    # 18. Other errors
    # -------------------------------------------------------------
    except Exception as e:

        return Response(
            {
                "status": False,
                "message": str(e)
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )