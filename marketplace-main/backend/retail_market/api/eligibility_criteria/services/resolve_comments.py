from api.comments.models import Comment
from api.companies.models import Company
from api.eligibility_criteria.models import CriteriaBlockResponse


def resolve_comments_for_response_block(response_block: CriteriaBlockResponse, company: Company):
    comment_section = f'question/{response_block.id}'
    kyc_id = response_block.criteria_response.kyc_record_id
    path = f'/kyc_record/{kyc_id}'

    Comment.objects.filter(
        company=company,
        path=path,
        section__startswith=comment_section
    ).update(
        status=Comment.Statuses.RESOLVED.value
    )
