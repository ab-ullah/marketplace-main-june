from django.urls import re_path

from api.workflows.views.comment_views import WorkFlowCommentsListCreateView
from api.workflows.views.task_filter_options_view import TaskFilterOptionsAPIView
from api.workflows.views.task_views import TaskReviewersAPIView, TaskRetrieveUpdateDestroyAPIView, TasksListAPIView, \
    RecentTasksCountAPIView, RevisedChangesAPIView, CompanyUserTaskListAPIView
from api.workflows.views.task_views import (WorkFlowCurrentStepView,
                                            CompanyUserInProgressTaskAPIView,
                                            SubmitChangesForTaskAPIView, CreateGPSigningTaskView)

urlpatterns = [
    re_path(
        r'^(?P<workflow_id>\d+)/review-tasks$',
        TaskReviewersAPIView.as_view(),
        name='task-reviewers-api-view'
    ),
    re_path(
        r'^(?P<pk>\d+)/revised-changes$',
        RevisedChangesAPIView.as_view(),
        name='revised-changes-api-view'
    ),
    re_path(r'^(?P<workflow_id>\d+)/comments$', WorkFlowCommentsListCreateView.as_view(), name='comments-list-view'),
    re_path(
        r'^(?P<parent_workflow_id>\d+)/get-current-step',
        WorkFlowCurrentStepView.as_view(),
        name='workflow-current-step'
    ),
    re_path(r'^tasks$', TasksListAPIView.as_view(), name='tasks-list-view'),
    re_path(r'^tasks/recent-count$', RecentTasksCountAPIView.as_view(), name='tasks-count-view'),
    re_path(r'^tasks/(?P<pk>\d+)$', TaskRetrieveUpdateDestroyAPIView.as_view(), name='task-retrieve-update-view'),
    re_path(
        r'^tasks/(?P<pk>\d+)/submit-changes$',
        SubmitChangesForTaskAPIView.as_view(),
        name='task-submit-changes'
    ),
    re_path(
        r'^user-tasks/$',
        CompanyUserTaskListAPIView.as_view(),
        name='company-user-task-list-view'
    ),
    re_path(
        r'^user-tasks/in-progress$',
        CompanyUserInProgressTaskAPIView.as_view(),
        name='company-user-task-in-progress'
    ),
    re_path(
        r'^tasks/sg-signing-task$',
        CreateGPSigningTaskView.as_view(),
        name='create-gp-signing-task'
    ),
    re_path(r'^tasks/filters$', TaskFilterOptionsAPIView.as_view(), name='task-filters'),
]
