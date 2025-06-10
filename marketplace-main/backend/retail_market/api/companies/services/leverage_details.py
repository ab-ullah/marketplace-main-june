from api.companies.models import CompanyUser, CompanyRole


class GetLeverageOptionsService:
    def __init__(self, company_user: CompanyUser):
        self.company_user = company_user

    @staticmethod
    def get_ratio_option_value(val: str):
        if not val:
            return None
        if val == '0':
            return 0
        if len(val.split(':')) != 2:
            return None
        numerator, denominator = val.split(':')
        return int(numerator) / int(denominator)

    def get_option(self, role: CompanyRole):
        value = self.get_ratio_option_value(val=role.leverage_ratio)
        if value is None:
            return None
        return {'value': role.id, 'label': role.leverage_ratio, 'multiplier': value}

    def get_options(self, user_percentage: float):
        roles = self.company_user.company.company_roles.filter(
            leverage_percentage__lte=user_percentage
        ).order_by(
            'leverage_percentage'
        )
        options = []
        for role in roles:
            option = self.get_option(role=role)
            if option is not None:
                options.append(option)
        return options

    def process(self):
        company_user_role = self.company_user.role
        if not company_user_role or not company_user_role.leverage_percentage:
            return []
        return self.get_options(user_percentage=company_user_role.leverage_percentage)
