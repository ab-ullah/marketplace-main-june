from django.db import migrations


def code(apps, schema_editor):
    Company = apps.get_model("companies", "Company")
    Feature = apps.get_model("feature_flags", "Feature")
    CompanyFeatureFlag = apps.get_model("feature_flags", "CompanyFeatureFlag")
    coinvest_feature, _ = Feature.objects.get_or_create(name="coinvest",
                                                     defaults={"description": "enables access to coinvest menus and functionality"})
    for c in Company.objects.all():
        CompanyFeatureFlag.objects.update_or_create(company=c, feature=coinvest_feature, defaults={"active": True})
    pass


def reverse_code(apps, schema_editor):
    # we don't want to reverse this
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('feature_flags', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(code, reverse_code)
    ]
