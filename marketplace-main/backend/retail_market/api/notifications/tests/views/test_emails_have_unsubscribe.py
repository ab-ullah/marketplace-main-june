from rest_framework.test import APITestCase
import pathlib
import os


class EmailUnsubscribeAPITestCase(APITestCase):
    def setUp(self):
        dir_path = os.path.dirname(os.path.realpath(__file__))
        self.root = pathlib.Path(os.path.join(dir_path, "..", "..", ".."))
        self.templates = self.root.rglob('*_email*.html')

    def test_email_templates_have_explicit_unsubscribe(self):
        unsub_pattern = "unsubscribe_url"
        for template_file in self.templates:
            found = False
            with open(template_file, 'r') as file:
                lines = file.readlines()
                for line in lines:
                    if unsub_pattern in line:
                        found = True

            self.assertIs(found, True, "Expected to find {} in {}".format(unsub_pattern, template_file))

