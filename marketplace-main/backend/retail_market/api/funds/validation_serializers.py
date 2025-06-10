from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from api.funds.constants import FINAL_AMOUNT_FIELDS
from api.funds.models import LeverageOption
from api.funds.services.invite_user import LEVERAGE_RATIO_REGEX
from api.investors.models import Investor
from api.investors.services.validate_investor_user_relation import ValidateUserInvestorRelationService, \
    InvalidInvestorUserRelationException


class InviteFileRowSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    first_name = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    last_name = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    job_band = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    department = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    office_location = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    region = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    max_leverage = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    leverage_ratio = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    restricted_time_period = serializers.CharField(required=True, allow_null=False, allow_blank=False)
    restricted_geographic_area = serializers.CharField(required=True, allow_null=False, allow_blank=False)
    final_amount = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    final_leverage = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    total_investment = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    vehicle = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    share_class = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    investor_account_code = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    leverage_option_description = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    fund_id = serializers.IntegerField()
    max_levered_commitment_amount = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    def validate(self, attrs):
        max_leverage = attrs.get('max_leverage', '').strip()
        leverage = attrs.get('leverage_ratio')
        if max_leverage:
            if not LEVERAGE_RATIO_REGEX.match(max_leverage):
                raise ValidationError(
                    f'Invalid Leverage ratio format: {max_leverage}, please make sure leverage ratio is of format like: 4:1'
                )
    
        if leverage:
            if not LEVERAGE_RATIO_REGEX.match(leverage):
                raise ValidationError(
                    f'Invalid Leverage ratio format: {leverage}, please make sure leverage ratio is of format like: 4:1'
                )
            leverage_ratio = int(leverage.split(":")[0])
            leverage_option_description = attrs.get('leverage_option_description', "")

            leverage_option = LeverageOption.objects.filter(fund_id=attrs['fund_id'], amount=leverage_ratio, description=leverage_option_description)
            if not leverage_option.exists():
                raise ValidationError(
                    f'Invalid Leverage option: {leverage_ratio}, description: {leverage_option_description}'
                )

        final_amounts = [attrs.get(amount_field, '').strip() for amount_field in FINAL_AMOUNT_FIELDS]
        if any(final_amounts) and not all(final_amounts):
            raise ValidationError(
                'Please make sure to either provide all of Final Equity, Final Leverage, Final Leverage Option Description and Total Investment values or none of these values'
                )

        if attrs.get('investor_account_code'):
            investor = None
            try:
                investor = Investor.objects.get(investor_account_code=attrs['investor_account_code'])
            except Investor.DoesNotExist:
                pass

            if investor:
                try:
                    ValidateUserInvestorRelationService(investor=investor, email=attrs['email']).validate()
                except InvalidInvestorUserRelationException:
                    raise ValidationError(f'Invalid investor account code for the user with email: {attrs["email"]}')

        return attrs
