import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.multioutput import MultiOutputClassifier
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
import joblib

df = pd.read_csv("skills_data.csv")

X = df['text']
# The target is all the skill columns
SKILLS = ['medical', 'teaching', 'logistics', 'cooking', 'counseling', 'driving', 'construction', 'tech', 'translation', 'first-aid']
y = df[SKILLS]

# Pipeline with TF-IDF and MultiOutputClassifier
model = Pipeline([
    ('tfidf', TfidfVectorizer(stop_words='english')),
    ('clf', MultiOutputClassifier(MultinomialNB()))
])

model.fit(X, y)

joblib.dump(model, "skills_model.pkl")
print("✅ Skills extraction model trained and saved as skills_model.pkl")
