from core.managers.non_deleted_manager import NonDeletedManager


class NonReplacedDocumentsManager(NonDeletedManager):
    def get_queryset(self):
        return super().get_queryset().filter(is_replaced=False)
