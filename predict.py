import joblib
import sys

# Load model
model = joblib.load("model.pkl")

# Same mapping (must match training)
skill_map = {"medical":0, "teaching":1, "food":2, "rescue":3}
location_map = {"Pune":0, "Mumbai":1, "Nashik":2}
urgency_map = {"low":0, "medium":1, "high":2}
availability_map = {"no":0, "yes":1}

# Take input
vol_skill = sys.argv[1]
vol_location = sys.argv[2]
availability = sys.argv[3]
task_skill = sys.argv[4]
task_location = sys.argv[5]
urgency = sys.argv[6]

# Convert to numbers
data = [[
    skill_map[vol_skill],
    location_map[vol_location],
    availability_map[availability],
    skill_map[task_skill],
    location_map[task_location],
    urgency_map[urgency]
]]

# Predict
result = model.predict(data)

print(result[0])