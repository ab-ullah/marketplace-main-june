from api.applications.tests.factories import FundFactory
from api.eligibility_criteria.admin_views.custom_smart_block_views import CustomSmartBlockListCreateAPIView, \
    CustomSmartBlockUpdateAPIView, CustomSmartBlockFieldListCreateAPIView
from api.eligibility_criteria.models import CustomSmartBlock, CustomSmartBlockField
from api.eligibility_criteria.tests.factories import FundEligibilityCriteriaFactory
from core.tests.auth_base_test import AuthBaseTest

from api.eligibility_criteria.admin_views import fund_criteria_views as views
from api.eligibility_criteria.admin_views.fund_blocks import BlockListAPIView
from api.eligibility_criteria.admin_views import urls


class AdminEnpointsElegibilityCriteriaTest(AuthBaseTest):
    url_patterns = urls.urlpatterns

    def test_xxx_url_coverage(self):
        self.assert_url_coverage()

    def test_blocks_list(self):
        url_pattern = 'blocks-list'
        kwargs = {}
        view = BlockListAPIView.as_view()
        self.assert_admin_request(view, url_pattern, 'get', kwargs)

    def test_criteria_bulk_publish(self):
        url_pattern = 'bulk-publish-api'
        kwargs = {}
        view = views.BulkPublishAPIView.as_view()
        self.assert_admin_request(view, url_pattern, 'post', kwargs)


    def test_create_criteria(self):
        url_pattern = 'create-criteria'
        kwargs = {}
        view = views.FundEligibilityCriteriaCreateAPIView.as_view()
        self.assert_admin_request(view, url_pattern, 'post', kwargs)


    def test_retrieve_criteria(self):
        url_pattern = 'criteria-retrieve-view'
        kwargs = {'pk': '12'}
        view = views.CriteriaRetrieveAPIView.as_view()
        self.assert_admin_request(view, url_pattern, 'get', kwargs)

    def test_update_criteria(self):
        url_pattern = 'criteria-update-view'
        kwargs = {'pk': '12'}
        view = views.CriteriaRetrieveAPIView.as_view()
        self.assert_admin_request(view, url_pattern, 'get', kwargs)

    def test_preview_criteria(self):
        url_pattern = 'criteria-preview-retrieve-view'
        kwargs = {'pk': '12'}
        view = views.CriteriaPreviewRetrieveAPIView.as_view()
        self.assert_admin_request(view, url_pattern, 'get', kwargs)

    def test_document_create(self):
        url_pattern = 'criteria-document-create-view'
        kwargs = {'pk': '12'}
        view = views.CriteriaDocumentCreateAPIView.as_view()
        self.assert_admin_request(view, url_pattern, 'post', kwargs)

    def test_connector_update(self):
        url_pattern = 'connector-update-view'
        kwargs = {'pk': '12'}
        view = views.CriteriaBlockConnectorUpdateAPIView.as_view()
        self.assert_admin_request(view, url_pattern, 'put', kwargs)

    def test_criteria_block_update(self):
        url_pattern = 'criteria_block-update-view'
        kwargs = {'pk': '12'}
        view = views.CriteriaBlockUpdateAPIView.as_view()
        self.assert_admin_request(view, url_pattern, 'put', kwargs)


    def test_block_update_position(self):
        url_pattern = 'criteria_block-update-view'
        kwargs = {'pk': '12'}
        view = views.UpdateCriteriaBlockPositionAPIView.as_view()
        self.assert_admin_request(view, url_pattern, 'put', kwargs)


    def test_document_list(self):
        url_pattern = 'criteria-document-list-view'
        kwargs = {'criteria_id': '12'}
        view = views.CriteriaDocumentListAPIView.as_view()
        self.assert_admin_request(view, url_pattern, 'get', kwargs)


    def test_add_block(self):
        url_pattern = 'criteria-add-block'
        kwargs = {'criteria_id': '12'}
        view = views.CriteriaBlockCreateAPIView.as_view()
        self.assert_admin_request(view, url_pattern, 'post', kwargs)

    def test_kyc_response(self):
        url_pattern = 'kyc-criteria-response-admin'
        kwargs = {'pk': '12'}
        view = views.EligibilityCardsAPIView.as_view()
        self.assert_admin_request(view, url_pattern, 'get', kwargs)

    def test_get_fund_investment_amount_response(self):
        url_pattern = 'get-fund-investment-amount'
        kwargs = {'fund_external_id': 'fund_external_id'}
        view = views.GetInvestmentAmountAPIView.as_view()
        self.assert_admin_request(view, url_pattern, 'get', kwargs)

    def test_admin_investment_amount_update_response(self):
        url_pattern = 'admin-investment-amount-update'
        kwargs = {'pk': '12'}
        view = views.UpdateInvestmentAmountAPIView.as_view()
        self.assert_admin_request(view, url_pattern, 'patch', kwargs)

    def test_get_custom_smart_blocks(self):
        url_pattern = 'admin-custom-smart-blocks'
        kwargs = {}
        view = CustomSmartBlockListCreateAPIView.as_view()
        self.assert_admin_request(view, url_pattern, 'get', kwargs)

    def test_get_custom_smart_block_update(self):
        url_pattern = 'admin-custom-smart-block-update'
        fund = FundFactory()
        custom_smart_block = CustomSmartBlock.objects.create(
            fund=fund,
            company=fund.company,
            eligibility_criteria=FundEligibilityCriteriaFactory(),
            created_by=self.company_admin,
            title='title'
        )
        kwargs = {'pk': custom_smart_block.id}
        view = CustomSmartBlockUpdateAPIView.as_view()
        self.assert_admin_request(view, url_pattern, 'get', kwargs)

    def test_get_custom_smart_block_fields(self):
        url_pattern = 'admin-custom-smart-block-fields'
        fund = FundFactory()
        custom_smart_block = CustomSmartBlock.objects.create(
            fund=fund,
            company=fund.company,
            eligibility_criteria=FundEligibilityCriteriaFactory(),
            created_by=self.company_admin,
            title='title'
        )
        kwargs = {'block_id': custom_smart_block.id}
        view = CustomSmartBlockFieldListCreateAPIView.as_view()
        self.assert_admin_request(view, url_pattern, 'get', kwargs)

    def test_get_custom_smart_block_fields_update(self):
        url_pattern = 'admin-custom-smart-block-fields-update'
        fund = FundFactory()
        custom_smart_block = CustomSmartBlock.objects.create(
            fund=fund,
            company=fund.company,
            eligibility_criteria=FundEligibilityCriteriaFactory(),
            created_by=self.company_admin,
            title='title'
        )
        field = CustomSmartBlockField.objects.create(
            block=custom_smart_block,
            title='new-field'
        )
        kwargs = {'block_id': custom_smart_block.id, 'pk': field.id}
        view = CustomSmartBlockFieldListCreateAPIView.as_view()
        self.assert_admin_request(view, url_pattern, 'get', kwargs)

    def test_expression_validation(self):
        url_pattern = 'validate-update-custom-expression-view'
        kwargs = {}
        view = views.UpdateAndValidateExpression.as_view()
        self.assert_admin_request(view, url_pattern, 'post', kwargs)

    def test_expression_evaluation(self):
        url_pattern = 'criteria-custom-expression-view'
        fund = FundFactory(company=self.company)
        criteria = FundEligibilityCriteriaFactory(fund=fund)
        kwargs = {'pk': criteria.id}
        view = views.CalculateCustomExpressionLogicDecision.as_view()
        self.assert_admin_request(view, url_pattern, 'post', kwargs)

    def test_admin_custom_logic_block(self):
        url_pattern = 'admin-custom-logic-block'
        criteria = FundEligibilityCriteriaFactory()
        kwargs = {'pk': criteria.id}
        view = views.AddCustomLogicCriteriaBlock.as_view()
        self.assert_admin_request(view, url_pattern, 'post', kwargs)

    def test_add_smart_block_connector(self):
        url_pattern = 'smart-decision-block-connector-create'
        kwargs = {'criteria_id': '12'}
        view = views.SmartDecisionBlockConnectorCreateAPIView.as_view()
        self.assert_admin_request(view, url_pattern, 'post', kwargs)

    def test_delete_smart_block_connector(self):
        url_pattern = 'smart-decision-block-connector-delete'
        kwargs = {'criteria_id': '12'}
        view = views.SmartDecisionCriteriaBlockConnectorDelete.as_view()
        self.assert_admin_request(view, url_pattern, 'post', kwargs)

    def test_get_custom_block_templates(self):
        url_pattern = 'list-criteria-custom-block-templates'
        view = views.SmartDecisionCriteriaBlockConnectorDelete.as_view()
        self.assert_admin_request(view, url_pattern, 'get', kwargs={})


    def test_update_custom_block_templates(self):
        url_pattern = 'update-custom-block-templates'
        view = views.SmartDecisionCriteriaBlockConnectorDelete.as_view()
        self.assert_admin_request(view, url_pattern, 'post', kwargs={'pk': 1})

    def test_create_block_from_template(self):
        url_pattern = 'create-block-from-template'
        view = views.SmartDecisionCriteriaBlockConnectorDelete.as_view()
        self.assert_admin_request(view, url_pattern, 'post', kwargs={'criteria_id': 1, 'template_id':2})

