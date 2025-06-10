
from django.core.files.base import ContentFile
from django.core.files.storage import FileSystemStorage
from api.interest_statements.libs.interest_statement_document import InterestStatementDocument
from api.interest_statements.services.transactions_importer import TransactionsImporter
from api.interest_statements.services.process_tracker import ProcessTracker

class InterestStatementService:
    def __init__(self):
        self.process_tracker = None
        self.fs = FileSystemStorage()
        self.transactions_importer = TransactionsImporter()
        self.interest_statement_doc = InterestStatementDocument('application/pdf', 4)

    def start_processing_file(self, file, process_name, output_content_type, created_by):
        self.process_tracker = ProcessTracker(process_name, created_by)
        self.process_tracker.start()
        # This is meant to be an async process
        self.create_statement_files_from_csv(file, output_content_type)
        return self.process_tracker.process_id

    def create_statement_files_from_csv(self, csv_file, output_content_type):
        filename = self.fs.save(csv_file.name, csv_file)

        try:
            process_result_type, process_results = self.transactions_importer.do_import(self.fs.path(filename), output_content_type)
            self.process_tracker.move_in_progress()
            if process_result_type == 'application/pdf':
                for file_info in process_results:
                    stored_file = self.interest_statement_doc.store(
                        ContentFile(
                            file_info.get('file'),
                            file_info.get('name')
                        ))
            self.process_tracker.move_completed()
        except Exception as ex:
            error_msg = 'An error occurred while processing input file {}: {}'.format(csv_file.name, ex)
            self.process_tracker.move_failed(error_msg)
            print(error_msg)
        finally:
            self.fs.delete(filename)


