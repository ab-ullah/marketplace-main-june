from fontTools.misc.testTools import TestCase
from rest_framework.serializers import Serializer

from api.dsls.serializer_fields import FilterLangCharField


class SomeSerializer(Serializer):
    def update(self, instance, validated_data):
        pass

    def create(self, validated_data):
        pass

    code = FilterLangCharField()


class GrammarFieldTestCase(TestCase):

    def test_correct_field(self):
        serializer = SomeSerializer(data={"code":
                                              """
                                              set a = '123'
                                              set b = 'abcd'
                                              if a == '123' { 
                                                  set a = 'hello world!' 
                                              }
                                              if b {
                                                  set b = "it's a mee"
                                                  set us_holder_field1 = fields[a]
                                                  require b
                                              }
                                              """
                                          }

                                    )
        self.assertTrue(serializer.is_valid())

    def test_incorrect_field(self):
        serializer = SomeSerializer(data=
                                    {
                                        "code": """
                                              set a = '123'
                                              set bdfsdf
                                              if  = "it's a mee"
                                                  set us_holder_field1 = fields[a]
                                                  require b
                                              }
                                              """
                                          }
                                    )
        self.assertFalse(serializer.is_valid())
