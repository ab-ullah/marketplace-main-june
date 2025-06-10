import os


def setup_environment():
    environment = os.environ.get('APP_ENVIRONMENT', 'local')
    environment_supported = ['prod', 'stage', 'local', 'dev']
    if environment not in environment_supported:
        raise Exception('Please set environment variable APP_ENVIRONMENT from %s' % environment_supported)

    settings_mapping = {
        'prod': 'config.settings.prod',
        'stage': 'config.settings.stage',
        'dev': 'config.settings.dev',
        'local': 'config.settings.local',
    }
    os.environ['DJANGO_SETTINGS_MODULE'] = settings_mapping[environment]
