from api.funds.models import Fund
from api.funds.services.invite_file_importers.riverside.riverside_importer import RiverSideImporter
from api.funds.services.process_invite_file import ProcessInviteFileService


def get_invite_file_processor(fund: Fund):
    company = fund.company
    if hasattr(company, 'importer'):
        if company.importer.importer_name == 'RiverSideImporter':
            return RiverSideImporter

    return ProcessInviteFileService
