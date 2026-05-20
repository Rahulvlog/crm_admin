# views.py

import os
from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.core.files.storage import FileSystemStorage


@api_view(['POST'])
def upload_image_api(request):

    try:

        # Get Image
        image = request.FILES.get('image')

        if not image:
            return Response({
                "status": False,
                "message": "Image file is required"
            })

        # Create Folder
        upload_path = os.path.join(settings.MEDIA_ROOT, 'uploads')

        if not os.path.exists(upload_path):
            os.makedirs(upload_path)

        # Save Image
        fs = FileSystemStorage(location=upload_path)

        filename = fs.save(image.name, image)

        # Image URL
        image_url = request.build_absolute_uri(
            settings.MEDIA_URL + 'uploads/' + filename
        )

        return Response({
            "status": True,
            "message": "Image uploaded successfully",
            "image_name": filename,
            "image_url": image_url
        })

    except Exception as e:

        return Response({
            "status": False,
            "message": str(e)
        })