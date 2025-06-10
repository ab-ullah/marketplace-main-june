from unittest import TestCase

from django.utils.datetime_safe import datetime

from api.libs.utils.date_util import DateUtil


class DateUtilTestCase(TestCase):

    def test_closest_nxt_qrtr_end_date(self):
        my_date = datetime(2024, 1, 26, 15, 29, 7, 47097)
        res = DateUtil.closest_nxt_qrtr_end_date(my_date)
        self.assertEqual((res.year, res.month, res.day), (2024, 3, 31))
