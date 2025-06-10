from rest_framework.response import Response
from rest_framework.views import APIView

from api.workflows.models import Task
from api.workflows.views.task_views import TaskAPIViewMixin


class TaskFilterOptionsAPIView(TaskAPIViewMixin, APIView):
    def get(self, request):
        base_queryset = self.get_queryset().prefetch_related(
            'workflow__fund'
        )
        tasks = base_queryset
        fund_options = []
        seen_funds = set()
        module_options = []
        seen_modules = set()
        status_options = []
        seen_status = set()
        task: Task
        for task in tasks:
            if task.workflow.fund and task.workflow.fund_id not in seen_funds:
                fund_options.append({'value': task.workflow.fund_id, 'label': task.workflow.fund.name})
                seen_funds.add(task.workflow.fund_id)
            if task.workflow.module and task.workflow.module not in seen_modules:
                module_options.append({'value': task.workflow.module, 'label': task.workflow.get_module_display()})
                seen_modules.add(task.workflow.module)
            if task.status not in seen_status:
                status_options.append(
                    {'value': task.status, 'label': task.get_status_display()}
                )
                seen_status.add(task.status)

        return Response({
            'fund_options': fund_options,
            'status_options': status_options,
            'module_options': module_options,
        })
