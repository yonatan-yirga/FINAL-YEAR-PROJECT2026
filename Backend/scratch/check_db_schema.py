import sqlite3
import os

db_path = 'db.sqlite3'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("PRAGMA table_info(internships);")
columns = cursor.fetchall()

print(f"{'CID':<3} | {'Name':<25} | {'Type':<10} | {'Notnull':<7} | {'Default':<10} | {'PK':<2}")
print("-" * 70)
for col in columns:
    print(f"{col[0]:<3} | {col[1]:<25} | {col[2]:<10} | {col[3]:<7} | {str(col[4]):<10} | {col[5]:<2}")

conn.close()
