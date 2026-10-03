from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0004_appusers_password_changed_at_usersession"),
    ]

    operations = [
        migrations.CreateModel(
            name="SubAdminStateAssignment",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("assigned_by", models.IntegerField(default=0)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "state",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="sub_admin_assignments",
                        to="api.statemaster",
                    ),
                ),
                (
                    "sub_admin",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="assigned_states",
                        to="api.appusers",
                    ),
                ),
            ],
            options={
                "db_table": "sub_admin_state_assignments",
                "managed": True,
                "unique_together": {("sub_admin", "state")},
            },
        ),
    ]
