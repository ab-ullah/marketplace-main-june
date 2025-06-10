from django.db import IntegrityError

from api.cards.models import Workflow as CardWorkFlow
from api.constants.kyc_investor_types import KYCInvestorType
from api.kyc_records.tests.factories import CardWorkFlowFactory, KYCRecordWithoutCompanyUserFactory
from core.base_tests import BaseTestCase


class KYCUniqueConstrainTestCase(BaseTestCase):
    def setUp(self) -> None:
        self.create_company()
        self.create_user()

    def test_unique_validation_fail(self):
        workflow = CardWorkFlowFactory(
            company=self.company,
            type=CardWorkFlow.FLOW_TYPES.KYC.value,
        )

        KYCRecordWithoutCompanyUserFactory(
            user=self.user,
            company=self.company,
            kyc_investor_type=KYCInvestorType.INDIVIDUAL.value,
            workflow=workflow
        )

        with self.assertRaises(IntegrityError):
            KYCRecordWithoutCompanyUserFactory(
                user=self.user,
                company=self.company,
                kyc_investor_type=KYCInvestorType.INDIVIDUAL.value,
                workflow=workflow
            )

    def test_unique_validation_not_fail_on_deleted(self):
        workflow = CardWorkFlowFactory(
            company=self.company,
            type=CardWorkFlow.FLOW_TYPES.KYC.value,
        )

        kyc_record_individual = KYCRecordWithoutCompanyUserFactory(
            user=self.user,
            company=self.company,
            kyc_investor_type=KYCInvestorType.INDIVIDUAL.value,
            workflow=workflow
        )

        kyc_record_individual.deleted = True
        kyc_record_individual.save()

        KYCRecordWithoutCompanyUserFactory(
            user=self.user,
            company=self.company,
            kyc_investor_type=KYCInvestorType.INDIVIDUAL.value,
            workflow=workflow
        )

        participant_record = KYCRecordWithoutCompanyUserFactory(
            user=self.user,
            company=self.company,
            kyc_investor_type=KYCInvestorType.PARTICIPANT.value,
            workflow=workflow
        )

        participant_record.deleted = True
        participant_record.save()

        for _ in range(4):
            KYCRecordWithoutCompanyUserFactory(
                user=self.user,
                company=self.company,
                kyc_investor_type=KYCInvestorType.PARTICIPANT.value,
                workflow=workflow
            )

        KYCRecordWithoutCompanyUserFactory(
            company=self.company,
            kyc_investor_type=KYCInvestorType.INDIVIDUAL.value,
            workflow=workflow
        )

        KYCRecordWithoutCompanyUserFactory(
            user=self.user,
            company=self.company,
            kyc_investor_type=KYCInvestorType.ENTITY.value,
            workflow=workflow
        )

        with self.assertRaises(IntegrityError):
            KYCRecordWithoutCompanyUserFactory(
                user=self.user,
                company=self.company,
                kyc_investor_type=KYCInvestorType.ENTITY.value,
                workflow=workflow
            )
