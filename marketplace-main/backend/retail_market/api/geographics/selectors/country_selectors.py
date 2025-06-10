from api.geographics.models import Country


def get_country_id_name_map():
    countries = Country.objects.values('id', 'name')
    country_id_name_map = {}
    for country in countries:
        country_id_name_map[country['id']] = country['name']
    return country_id_name_map
