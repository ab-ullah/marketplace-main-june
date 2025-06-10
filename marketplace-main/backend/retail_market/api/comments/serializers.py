from rest_framework import serializers

from api.comments.models import Comment, ApplicationComment, ApplicationCommentReply, ModuleChoices
from api.comments.utils import response_block_id_from_comment
from api.eligibility_criteria.models import CriteriaBlockResponse
from api.workflows.services.send_application_changes_requested_email import SendChangesRequestedEmail
from api.comments.services.update_comment_status import UpdateCommentService
from api.users.serializers import RetailUserListSerializer


class CommentSerializer(serializers.ModelSerializer):
    question_text = serializers.SerializerMethodField()

    def validate(self, attrs):
        attrs['company'] = self.context['user'].company
        return super(CommentSerializer, self).validate(attrs=attrs)

    def create(self, validated_data):
        instance = Comment.objects.create(
            text=validated_data['text'],
            status=Comment.Statuses.CREATED,
            path=validated_data['path'],
            section=validated_data['section'],
            created_by=self.context['user'],
            company=validated_data['company'],
        )
        return instance

    @staticmethod
    def get_question_text(obj: Comment):
        response_question = response_block_id_from_comment(comment=obj)
        if isinstance(response_question, int):
            try:
                response_block = CriteriaBlockResponse.objects.get(id=response_question)
                if response_block.block.custom_block:
                    return response_block.block.custom_block.title
                return response_block.block.block.title
            except CriteriaBlockResponse.DoesNotExist:
                return ''
        return response_question

    class Meta:
        model = Comment
        fields = ('id', 'text', 'status', 'path', 'section', 'company', 'created_by', 'created_at', 'question_text')
        read_only_fields = ['created_by', 'company']


class ApplicationCommentReplyCreateSerializer(serializers.ModelSerializer):
    is_admin_user = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = ApplicationCommentReply
        fields = ('text', 'is_admin_user',)

    def create(self, validated_data):
        validated_data['reply_by'] = self.context['request'].user
        validated_data['comment'] = self.context['comment']
        return super().create(validated_data)

    def get_is_admin_user(self, instance):
        request = self.context.get('request', None)
        if request:
            return hasattr(request.user, 'admin_user')

        return False


class ApplicationCommentReplySerializer(serializers.ModelSerializer):
    reply_by = RetailUserListSerializer(read_only=True)
    is_admin_user = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = ApplicationCommentReply
        fields = "__all__"

    def get_is_admin_user(self, instance):
        return hasattr(instance.reply_by, 'admin_user')


class ApplicationCommentSerializer(serializers.ModelSerializer):
    question_text = serializers.SerializerMethodField()
    replies = ApplicationCommentReplySerializer(many=True, read_only=True)

    def validate(self, attrs):
        if not attrs.get('kyc_record') and not attrs.get('application'):
            raise serializers.ValidationError('Either KYC Record or Application is required to create a comment')
        attrs['company'] = self.context['company']
        attrs['commented_by'] = self.context['user']
        return super().validate(attrs=attrs)

    @staticmethod
    def get_question_text(obj: ApplicationComment):
        response_question = obj.question_identifier
        is_eligibility_module = obj.module == ModuleChoices.ELIGIBILITY_CRITERIA
        if is_eligibility_module and response_question.isdigit():
            try:
                response_block = CriteriaBlockResponse.objects.get(id=int(response_question))
                if response_block.block.custom_block:
                    return response_block.block.custom_block.title
                return response_block.block.block.title
            except CriteriaBlockResponse.DoesNotExist:
                return response_question
        return response_question

    def create(self, validated_data):
        return super().create(validated_data)
        # application = self.context.get('application')
        # Commenting out the comment email alert functionality for
        # https://www.notion.so/sidecar-financial/Don-t-send-the-email-to-the-investor-when-flagging-fields-3e926de13c7e46f58582acc70746dd41
        # user = None
        # if comment.kyc_record:
        #     user = comment.kyc_record.user
        # if comment.application:
        #     user = comment.application.user
        #
        # if application:
        #     SendChangesRequestedEmail(
        #         requested_by=self.context['admin_user'],
        #         subject_user=user,
        #         fund_external_id=application.fund.external_id,
        #         fund_name=application.fund.name
        #     ).send_changes_requested_email()
        # return comment

    class Meta:
        model = ApplicationComment
        fields = '__all__'
        read_only_fields = ['commented_by', 'company']


class CommentUpdatedByModuleSerializer(serializers.Serializer):
    module = serializers.IntegerField()
    module_id = serializers.IntegerField()

    def create(self, validated_data):
        user = self.context['request'].user
        ApplicationComment.objects.filter(
            comment_for=user,
            module=validated_data['module'],
            module_id=validated_data['module_id'],
            status=ApplicationComment.Statuses.CREATED
        ).update(status=ApplicationComment.Statuses.UPDATED)
        return validated_data


class CommentsSerializer(serializers.ModelSerializer):

    def update(self, instance, validated_data):
        updated_instance = super().update(instance=instance, validated_data=validated_data)
        ApplicationComment.objects.filter(
            application=updated_instance.application,
            module=updated_instance.module,
            module_id=updated_instance.module_id,
            status__in=[ApplicationComment.Statuses.CREATED, ApplicationComment.Statuses.UPDATED],
            question_identifier=updated_instance.question_identifier
        ).update(status=ApplicationComment.Statuses.RESOLVED)
        return updated_instance

    class Meta:
        model = ApplicationComment
        fields = "__all__"
        read_only_fields = ['created_by', 'company']
