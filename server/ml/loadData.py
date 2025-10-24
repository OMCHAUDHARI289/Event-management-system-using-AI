# loadData.py
import pandas as pd
from pymongo import MongoClient

def fetch_student_data():
    client = MongoClient("mongodb://localhost:27017/")
    db = client['event_db']         # your DB name
    students = db.students.find()   # your student collection
    registrations = db.registrations.find()

    # Convert to DataFrame
    students_df = pd.DataFrame(list(students))
    reg_df = pd.DataFrame(list(registrations))
    
    # Merge or prepare features
    data = pd.merge(students_df, reg_df, left_on="_id", right_on="userId", how="left")
    return data

if __name__ == "__main__":
    df = fetch_student_data()
    print(df.head())
