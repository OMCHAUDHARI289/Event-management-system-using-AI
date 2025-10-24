import joblib
from sklearn.ensemble import RandomForestRegressor
from loadData import fetch_student_data

def train_model():
    df = fetch_student_data()
    df.fillna(0, inplace=True)  # handle missing data

    # Features and target
    X = df[["totalRegistrations", "totalAttended", "totalFeedback"]]
    y = df["points"]

    # Train model
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X, y)

    # Save model
    joblib.dump(model, "achievement_model.pkl")
    print("Model trained and saved!")

if __name__ == "__main__":
    train_model()
