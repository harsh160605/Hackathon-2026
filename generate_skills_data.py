import pandas as pd
import random

# Predefined skills in the frontend
SKILLS = ['medical', 'teaching', 'logistics', 'cooking', 'counseling', 'driving', 'construction', 'tech', 'translation', 'first-aid']

# Mapping text snippets to skills (1 snippet can map to multiple skills)
raw_data = [
    ("We need doctors and nurses for a blood donation drive.", ['medical', 'first-aid']),
    ("Looking for someone to transport food supplies to the shelter.", ['logistics', 'driving']),
    ("Need volunteers to prepare meals for the homeless.", ['cooking']),
    ("Help required to build temporary shelters for flood victims.", ['construction', 'logistics']),
    ("Seeking software engineers to build our NGO website.", ['tech']),
    ("Need counselors to talk to traumatized children after the disaster.", ['counseling']),
    ("Looking for english to spanish translators for our medical brochures.", ['translation', 'tech']),
    ("First responder training camp next week, need certified instructors.", ['teaching', 'first-aid']),
    ("Transporting building materials to the rural school site.", ['driving', 'construction', 'logistics']),
    ("Cooking large batches of rice and teaching people basic hygiene.", ['cooking', 'teaching', 'medical']),
    ("Setting up a medical camp with mobile clinics.", ['medical', 'driving']),
    ("Need structural engineers to assess earthquake damage.", ['construction']),
    ("Psychological support needed for victims.", ['counseling']),
    ("Translate documents for the refugees.", ['translation']),
    ("Web developers and data entry volunteers needed.", ['tech'])
]

# Create dataset
rows = []
for _ in range(100):  # Expand dataset
    for text, labels in raw_data:
        row = {'text': text}
        for skill in SKILLS:
            row[skill] = 1 if skill in labels else 0
        rows.append(row)

df = pd.DataFrame(rows)
df = df.sample(frac=1).reset_index(drop=True)

df.to_csv("skills_data.csv", index=False)
print("skills_data.csv generated!")
