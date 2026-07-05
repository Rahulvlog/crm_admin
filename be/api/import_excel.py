import pandas as pd

# from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .models import (
    TasksRecord,
    AppUsers,
    ProjectMaster,
    StateMaster,
    CityMaster,
)


# class UploadTaskExcel(APIView):
@api_view(['GET', 'POST', 'PUT', 'DELETE'])
def uploadTaskExcel(request, id=None):
    if request.method == 'POST':

        file = request.FILES.get("file")

        if not file:
            return Response({
                "status": False,
                "message": "Please upload an Excel file."
            })

        try:

            df = pd.read_excel(file)
            # df.columns = df.columns.str.strip()
            df.columns = (
                df.columns.astype(str)
                .str.replace("\xa0", " ", regex=False)
                .str.replace(r"\s+", " ", regex=True)
                .str.replace(":", "", regex=False)
                .str.replace("*", "", regex=False)
                .str.strip()
            )

            inserted = 0
            failed = []

            for index, row in df.iterrows():

                try:

                    #########################################
                    # Project
                    #########################################

                    project_name = str(row.get("Project Name", "")).strip()

                    project, _ = ProjectMaster.objects.get_or_create(
                        title=project_name,
                    )

                    #########################################
                    # Client
                    #########################################

                    # client_name = str(row.get("Client Name", "")).strip()
                    # client_login = str(row.get("Client Login ID", "")).strip()
                    # client_password = str(row.get("Client Password", "")).strip()

                    # client, _ = AppUsers.objects.get_or_create(
                    #     username=client_login,
                    #     defaults={
                    #         "name": client_name,
                    #         "password": client_password,
                    #     }
                    # )

                    #########################################
                    # Employee
                    #########################################

                    emp_name = str(row.get("Employee Name", "")).strip()
                    emp_mobile = str(row.get("Employee Login id", "")).strip()
                    emp_password = str(row.get("Employee Password", "")).strip()

                    employee, _ = AppUsers.objects.get_or_create(
                        mobile_no=emp_mobile,
                        defaults={
                            "name": emp_name,
                            # "mobile_no": emp_mobile,
                            "password": emp_password,
                        }
                    )

                    #########################################
                    # Dealer
                    #########################################

                    # dealer_name = str(row.get("Dealer", "")).strip()

                    # dealer = AppUsers.objects.filter(
                    #     name__iexact=dealer_name
                    # ).first()

                    # dealer_id = dealer.id if dealer else 0

                    #########################################
                    # State
                    #########################################

                    state_name = str(row.get("State", "")).strip()

                    state = StateMaster.objects.filter(name__iexact=state_name).first()

                    if not state and state_name:
                        state = StateMaster.objects.create(name=state_name, country_id=0)

                    state_id = state.id if state else 0

                    #########################################
                    # City
                    #########################################

                    city_name = str(row.get("City", "")).strip()

                    city = CityMaster.objects.filter(name__iexact=city_name).first()

                    if not city and city_name:
                        city = CityMaster.objects.create(
                            name=city_name,
                            state_id=state_id      # agar CityMaster me state foreign key hai
                        )

                    city_id = city.id if city else 0

                    #########################################
                    # Save Task
                    #########################################

                    TasksRecord.objects.create(

                        emp_id=employee.id,
                        # client_id=client.id,
                        project_id=project.id,

                        state=state_id,
                        city=city_id,

                        tehsil=str(row.get("Tahsil", "")),
                        village=str(row.get("Village", "")),

                        task_name=project_name,

                        site_location=str(row.get("Site Location Name", "")),

                        sia_app_dealer_name=str(row.get("Dealer", "")),

                        code=str(row.get("Dealer Code", "")),

                        no_of_flex=int(row.get("No. of DWP", 0)) if pd.notna(row.get("No. of DWP")) else 0,

                        size_of_flex=str(row.get("Size of DWP", "")),

                        location_type=str(row.get("Location Type", "Assigned")),

                        # status=1
                    )

                    inserted += 1

                except Exception as e:

                    failed.append({
                        "row": index + 2,
                        "error": str(e)
                    })

            return Response({

                "status": True,
                "message": "Excel uploaded successfully.",

                "inserted": inserted,
                "failed": len(failed),

                "errors": failed

            })

        except Exception as e:

            return Response({

                "status": False,
                "message": str(e)

            }, status=status.HTTP_400_BAD_REQUEST)
        
    return Response({"error": "Method not allowed"}, status=status.HTTP_404_NOT_FOUND)