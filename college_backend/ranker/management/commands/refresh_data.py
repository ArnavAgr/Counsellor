from django.core.management.base import BaseCommand
from django.db import connection
from ranker.import_data import import_data

class Command(BaseCommand):
    help = 'Refreshes all data by clearing existing records and re-importing from Excel files'

    def handle(self, *args, **options):
        self.stdout.write('Clearing existing data...')
        with connection.cursor() as cursor:
            # Add State model to the TRUNCATE statement
            cursor.execute('TRUNCATE ranker_branch, ranker_institute, ranker_city, ranker_state CASCADE;')
        
        self.stdout.write('Importing fresh data...')
        import_data()
        
        self.stdout.write(self.style.SUCCESS('Data refresh completed successfully'))
