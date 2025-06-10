from api.geographics.serializers import RegionSelectorSerializer, CountrySelectorSerializer


class RegionCountryParsingService:
    @staticmethod
    def parse(regions, countries):
        region_options = RegionSelectorSerializer(regions, many=True).data
        for region in region_options:
            region['label'] = f"{region['label']} ({len(region['countries'])} countries)"
            region['value'] = f"RG|{region['value']}"
        return [
            {
                'label': 'Regions',
                'options': region_options
            },
            {
                'label': 'Countries',
                'options': CountrySelectorSerializer(countries, many=True).data
            }
        ]
