import os
from django.conf import settings
from django.core.files.storage import FileSystemStorage
from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(['GET'])
def upload_image_api(request):
    try:

        task_id = request.query_params.get('task_id')
        latitude = request.query_params.get('latitude')
        longitude = request.query_params.get('longitude')

        image = request.FILES.get('image')

        if not image:
            return Response({
                "status": False,
                "message": "Image file is required"
            })

        if not task_id:
            return Response({
                "status": False,
                "message": "task_id is required"
            })

        # Folder Name
        folder_name = f"task_{task_id}_{latitude}_{longitude}"

        # Create Folder
        upload_path = os.path.join(
            settings.MEDIA_ROOT,
            'uploads',
            folder_name
        )

        os.makedirs(upload_path, exist_ok=True)

        # Save Image
        fs = FileSystemStorage(location=upload_path)

        filename = fs.save(image.name, image)

        image_url = request.build_absolute_uri(
            f"{settings.MEDIA_URL}uploads/{folder_name}/{filename}"
        )

        return Response({
            "status": True,
            "message": "Image uploaded successfully",
            "task_id": task_id,
            "latitude": latitude,
            "longitude": longitude,
            "image_name": filename,
            "image_url": image_url
        })

    except Exception as e:
        return Response({
            "status": False,
            "message": str(e)
        })