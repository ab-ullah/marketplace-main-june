from core.managers.non_deleted_manager import NonDeletedManager


class HasCompanyFilterManager(NonDeletedManager):
    ERROR_MSG = "Company is a required filter. If you are using all(), use filter(company=company) " \
                "or filter(company__in=companies) instead."

    def _validate_and_dispatch(self, _func, *args, **kwargs):
        keys = {'company', 'company_id', 'company__in', 'company_id__in'}
        if any(key in kwargs for key in keys):
            return _func(*args, **kwargs)

        raise ValueError(self.ERROR_MSG)

    def get(self, *args, **kwargs):
        return self._validate_and_dispatch(super(NonDeletedManager, self).get, *args, **kwargs)

    # TODO: DRF internal serializer function create querset with all, without a filter, that fails here
    # TODO: Need to find an alternative for this
    # def all(self, *args, **kwargs):
    #     return self._validate_and_dispatch(super(NonDeletedManager, self).all, *args, **kwargs)

    def filter(self, *args, **kwargs):
        return self._validate_and_dispatch(super(NonDeletedManager, self).filter, *args, **kwargs)
