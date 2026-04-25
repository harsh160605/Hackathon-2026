import pandas as pd
import random

# Seed data for NLP training
data = [
    # Critical
    ("Major earthquake struck the city, multiple buildings collapsed, immediate rescue needed", "critical"),
    ("Massive fire in a residential building, need firefighters and emergency medical staff right now", "critical"),
    ("Flood victims stranded on roofs, immediate evacuation required", "critical"),
    ("Multi-vehicle accident on highway, multiple casualties, urgent blood donation required", "critical"),
    ("Building collapse trapping dozens, search and rescue dogs needed immediately", "critical"),
    ("Tsunami warning issued, urgent help needed to evacuate coastal areas", "critical"),
    ("Severe oxygen shortage in local hospital, patients dying, immediate supply needed", "critical"),
    ("Bomb blast in market, mass casualties, need emergency doctors and ambulances", "critical"),

    # High
    ("Urgent blood donation required for rare blood type patient", "high"),
    ("Medical supplies running low at the relief camp, need immediate restocking", "high"),
    ("Food distribution for 500 homeless people affected by the recent storm", "high"),
    ("Temporary shelters needed for displaced families before winter starts", "high"),
    ("Emergency first-aid volunteers needed for the upcoming marathon", "high"),
    ("Need doctors for a free health checkup camp in a slum area this weekend", "high"),
    ("Clean drinking water required immediately in village after pipeline burst", "high"),
    ("Urgent rescue of stray animals trapped in flooded area", "high"),

    # Medium
    ("Looking for volunteers to teach underprivileged kids on weekends", "medium"),
    ("Community awareness workshop on hygiene and sanitation next week", "medium"),
    ("Need volunteers to help organize the annual charity run", "medium"),
    ("Looking for people to assess the damage after the storm in rural areas", "medium"),
    ("Help needed to sort donated clothes at the community center", "medium"),
    ("Volunteers required to paint the local government school walls", "medium"),
    ("Tree plantation drive happening this Sunday, need hands", "medium"),
    ("Need counselors to conduct a mental health workshop for teenagers", "medium"),

    # Low
    ("Looking for someone to design a poster for our NGO event", "low"),
    ("Need help updating our community website with new photos", "low"),
    ("Data entry volunteers required for digitizing old records", "low"),
    ("Seeking a photographer to cover our annual general meeting next month", "low"),
    ("Need someone to translate our brochure from English to Marathi", "low"),
    ("Social media manager needed to post updates on our Facebook page", "low"),
    ("Help required to arrange chairs for the upcoming seminar", "low"),
    ("Need volunteers to distribute flyers in the neighborhood", "low")
]

# Generate more data by slightly modifying or duplicating to create a decent dataset size
expanded_data = []
for _ in range(50): # duplicate 50 times to create 1600 rows (enough for a simple model)
    for text, label in data:
        expanded_data.append([text, label])

df = pd.DataFrame(expanded_data, columns=["text", "urgency"])

# Shuffle data
df = df.sample(frac=1).reset_index(drop=True)

df.to_csv("priority_data.csv", index=False)
print("priority_data.csv generated with", len(df), "rows!")
