import pandas as pd
import random

skills = ["medical","teaching","food","rescue"]
locations = ["Pune","Mumbai","Nashik"]
availability = ["yes","no"]
urgency = ["low","medium","high"]

data = []

for _ in range(1000):
    vs = random.choice(skills)
    ts = random.choice(skills)
    vl = random.choice(locations)
    tl = random.choice(locations)
    av = random.choice(availability)
    ur = random.choice(urgency)

    # simple logic for match
    match = 1 if (vs == ts and vl == tl and av == "yes") else 0

    data.append([vs, vl, av, ts, tl, ur, match])

df = pd.DataFrame(data, columns=[
    "vol_skill","vol_location","availability",
    "task_skill","task_location","urgency","match"
])

df.to_csv("data.csv", index=False)
print("Data generated!")