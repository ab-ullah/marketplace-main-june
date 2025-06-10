from django.conf import settings

from api.fund_marketing_pages.models import IconOption


class CreateIconService:
    @staticmethod
    def create():
        base_path = settings.BASE_DIR
        images_info = [
            {'name': 'faq', 'path': '/../assets/images/faq.png'},
            {'name': 'guide', 'path': '/../assets/images/guide.png'},
            {'name': 'users', 'path': '/../assets/images/users.png'},
            {'name': 'world', 'path': '/../assets/images/world.png'},
        ]
        for image_info in images_info:
            path = base_path + image_info['path']
            with open(path, 'rb') as f:
                icon_option, _ = IconOption.objects.get_or_create(
                    name=image_info['name']
                )
                icon_option.icon.save(icon_option.name, f, save=True)
