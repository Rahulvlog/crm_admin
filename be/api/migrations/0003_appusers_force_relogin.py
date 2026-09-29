from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0002_activityrecord_appnotificationhistory_appusers_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="appusers",
            name="force_relogin",
            field=models.IntegerField(default=0),
        ),
    ]
