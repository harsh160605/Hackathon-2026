import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import make_pipeline
import joblib

# Load dataset
df = pd.read_csv("priority_data.csv")

X = df["text"]
y = df["urgency"]

# Create a pipeline that vectorizes the text and then trains Naive Bayes
model = make_pipeline(TfidfVectorizer(stop_words='english'), MultinomialNB())

# Train the model
model.fit(X, y)

# Save the model
joblib.dump(model, "priority_model.pkl")

print("✅ Priority NLP model trained and saved as priority_model.pkl")
