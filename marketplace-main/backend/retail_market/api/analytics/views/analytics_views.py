import csv
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.generics import RetrieveAPIView, ListCreateAPIView
from api.mixins.company_user_mixin import CompanyUserViewMixin
from api.analytics.serializers import AnalyticsFundInterestSerializer, AnalyticsEntityActionSerializer
from api.permissions.is_sidecar_admin_permission import IsSidecarAdminUser
from api.funds.models import Fund, FundInterest
from api.libs.utils.user_name import get_display_name
from collections import OrderedDict

class AnalyticsFundInterestAPIView(CompanyUserViewMixin, RetrieveAPIView):
    permission_classes = (IsSidecarAdminUser,)
    serializer_class = AnalyticsFundInterestSerializer
    lookup_field = 'slug'
    lookup_url_kwarg = 'slug'

    def get_queryset(self):
        fund_slug = self.request.GET.get('slug')
        queryset = Fund.objects.all()
        if fund_slug:
            queryset = queryset.filter(slug=fund_slug)
        return queryset


class AnalyticsEntityActionAPIView(CompanyUserViewMixin, ListCreateAPIView):
    serializer_class = AnalyticsEntityActionSerializer

class AnalyticsFundInterestExportAPIView(CompanyUserViewMixin, APIView):
    permission_classes = (IsSidecarAdminUser,)

    def get(self, *args, **kwargs):
        fund_id = self.kwargs['fund_id']
        submissions = FundInterest.objects.all().filter(fund_id=fund_id)
        response = HttpResponse(headers={'Content-type': "text/csv",
                              'Content-Disposition': 'attachment;filename="{}"'.format("indication_of_interest.csv")})
        writer = csv.writer(response)
        headers = OrderedDict()

        # Get the superset of headers since each submission may not have every question answered.
        for submission in submissions:
            for question in submission.interest_details:
                headers[question] = ""

        # these are set by us, they won't be in the answers submitted by the user, so we add
        # them explicitly so they appear in the CSV the way we want.
        full_headers = ['Submitted By', 'User Email', 'Submission Date', 'Equity Amount', 'Leverage Amount']

        # Add the headers we found from the questions submitted by all the users
        full_headers.extend(headers.keys())
        writer.writerow(full_headers)

        # Go back through the submissions and add each specific users submission.
        for submission in submissions:
            row = [get_display_name(submission.user.user),
                   submission.user.user.email,
                   submission.created_at,
                   submission.equity_amount,
                   submission.leverage_amount]
            for question in headers:
                answer = submission.interest_details.get(question, "")
                if not isinstance(answer, dict):
                    row.append(answer)
                else:
                    answer_value = answer['value']
                    row.append(answer_value)
            writer.writerow(row)

        return response

