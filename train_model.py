import pandas as pd
from sklearn.tree import DecisionTreeClassifier
import joblib

# Load dataset
df = pd.read_csv("data.csv")

# Mapping (VERY IMPORTANT)
skill_map = {"medical":0, "teaching":1, "food":2, "rescue":3}
location_map = {"Pune":0, "Mumbai":1, "Nashik":2}
urgency_map = {"low":0, "medium":1, "high":2}
availability_map = {"no":0, "yes":1}

# Convert text → numbers
df["vol_skill"] = df["vol_skill"].map(skill_map)
df["task_skill"] = df["task_skill"].map(skill_map)
df["vol_location"] = df["vol_location"].map(location_map)
df["task_location"] = df["task_location"].map(location_map)
df["urgency"] = df["urgency"].map(urgency_map)
df["availability"] = df["availability"].map(availability_map)

# Split data
X = df.drop("match", axis=1)
y = df["match"]

# Train model
model = DecisionTreeClassifier()
model.fit(X, y)

# Save model
joblib.dump(model, "model.pkl")

print("✅ Model trained and saved as model.pkl")