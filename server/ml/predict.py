import sys
import json

# Safe imports with error handling
try:
    import numpy as np
except ImportError:
    print("Error: numpy is not installed. Install it with `pip install numpy`.")
    sys.exit(1)

try:
    import joblib
except ImportError:
    print("Error: joblib is not installed. Install it with `pip install joblib`.")
    sys.exit(1)


def predict_achievement(input_data):
    # Load model safely
    try:
        model = joblib.load("achievement_model.pkl")
    except FileNotFoundError:
        print("Error: 'achievement_model.pkl' not found.")
        sys.exit(1)
    except Exception as e:
        print(f"Error loading model: {e}")
        sys.exit(1)

    # Extract input values with defaults
    totalRegistrations = int(input_data.get("totalRegistrations", 0))
    totalAttended = int(input_data.get("totalAttended", 0))
    totalFeedback = int(input_data.get("totalFeedback", 0))

    X = np.array([[totalRegistrations, totalAttended, totalFeedback]])

    try:
        prediction = model.predict(X)[0]
    except Exception as e:
        print(f"Error during prediction: {e}")
        sys.exit(1)

    return prediction


if __name__ == "__main__":
    # Use command-line argument if provided; fallback to stdin
    if len(sys.argv) > 1:
        input_str = sys.argv[1]
    else:
        input_str = sys.stdin.read()

    try:
        input_data = json.loads(input_str)
    except json.JSONDecodeError:
        print("Error: Invalid JSON input.")
        sys.exit(1)

    points = predict_achievement(input_data)
    print(points)
