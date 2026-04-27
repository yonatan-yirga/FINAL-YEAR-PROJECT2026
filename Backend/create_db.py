import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

def create_db():
    try:
        # Connect to the default postgres database to create a new one
        conn = psycopg2.connect(
            dbname='postgres',
            user='postgres',
            password='205089',
            host='localhost',
            port='5432'
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # Check if DB exists
        cursor.execute("SELECT 1 FROM pg_catalog.pg_database WHERE datname = 'internship'")
        exists = cursor.fetchone()
        
        if not exists:
            cursor.execute('CREATE DATABASE internship')
            print("Database 'internship' created successfully.")
        else:
            print("Database 'internship' already exists.")
            
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    create_db()
