import os
import joblib

# Predefined skills
SKILLS = ['medical', 'teaching', 'logistics', 'cooking', 'counseling', 'driving', 'construction', 'tech', 'translation', 'first-aid']

current_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(current_dir, "..", "skills_model.pkl")

try:
    skills_model = joblib.load(model_path)
except Exception as e:
    print(f"Warning: Could not load skills model from {model_path}: {e}")
    skills_model = None

def predict_skills(text: str):
    if not skills_model or not text.strip():
        # Fallback keyword matching
        found_skills = []
        text_lower = text.lower()
        for skill in SKILLS:
            if skill in text_lower or skill.replace('-', ' ') in text_lower:
                found_skills.append(skill)
        return found_skills

    try:
        # model.predict returns a 2D array of shape (1, num_skills)
        predictions = skills_model.predict([text])[0]
        
        extracted_skills = []
        for idx, val in enumerate(predictions):
            if val == 1:
                extracted_skills.append(SKILLS[idx])
                
        return extracted_skills
    except Exception as e:
        print("Error predicting skills:", e)
        return []
