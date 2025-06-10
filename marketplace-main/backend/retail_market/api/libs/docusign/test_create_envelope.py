from django.test import TestCase
from django.apps import apps
from api.libs.docusign.services import DocumentSigningService
import unittest


class DocumentSigningTestCase(TestCase):
    @unittest.skip("skip until ci has docusign setup")
    def test_create_envelope(self):
        envelope_args = {
            "signer_email": "test_email@gmail.com",
            "signer_name": "Testy Signy",
            "signer_client_id": "client_id_123",
            "file_name": "W-9-03.2024.pdf",
        }
       
        docusign_service = DocumentSigningService()
        try:
            results = docusign_service.create_envelope(envelope_args)
        except Exception as e:
            print(e)
        self.assertTrue(results.envelope_id)