from api.funds.services.invite_file_importers.riverside.constants import RIVERSIDE_INVITE_FILE_MAPPINGS, \
    MAX_LEVERAGE_PERCENTAGE
from api.funds.services.invite_file_importers.riverside.invite_user import RiverSideInviteUserToFund
from api.funds.services.invite_file_importers.riverside.serializers import RiverSideInviteFileRowSerializer
from api.funds.services.process_invite_file import ProcessInviteFileService


class RiverSideImporter(ProcessInviteFileService):
    MAPPINGS = RIVERSIDE_INVITE_FILE_MAPPINGS
    PERCENTAGE_FIELDS = (MAX_LEVERAGE_PERCENTAGE,)
    SERIALIZER = RiverSideInviteFileRowSerializer
    INVITE_USER = RiverSideInviteUserToFund

    def map_file_row(self, row):
        parsed_row = {}
        mappings = self.MAPPINGS
        for k, v in row.items():
            if mapped_key := mappings.get(k.strip()):
                if mapped_key in self.PERCENTAGE_FIELDS:
                    v = v.replace('%', '').strip() if v else None
                parsed_row[mapped_key] = v
        return parsed_row

    def process_invites(self):
        errors = []
        for row in self.read_file_rows():
            mapped_row = self.map_file_row(row=row)
            mapped_row['fund_id'] = self.fund.id
            serializer = self.SERIALIZER(data=mapped_row)
            if not serializer.is_valid(raise_exception=False):
                errors.append(serializer.errors)
                return errors
            self.INVITE_USER(
                invite_row=self.map_file_row(row),
                fund=self.fund
            ).process()
