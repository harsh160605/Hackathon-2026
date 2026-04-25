"""
NLP Priority Prediction Module
Uses a trained Text Classification model (TF-IDF + Naive Bayes) to predict urgency
"""

import os
import joblib

# Load the NLP model
current_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(current_dir, "..", "priority_model.pkl")

try:
    nlp_model = joblib.load(model_path)
except Exception as e:
    print(f"Warning: Could not load priority NLP model from {model_path}: {e}")
    nlp_model = None

# Fallback keywords if model fails to load
CRITICAL_KEYWORDS = ["emergency", "urgent", "critical", "flood", "earthquake", "fire", "disaster"]
HIGH_KEYWORDS = ["immediate", "asap", "health", "medical", "blood", "donation", "relief"]

def predict_priority(title: str, description: str, required_skills: list):
    """
    Predict urgency level based on full-text NLP analysis of title + description.
    Returns urgency level and confidence score.
    """
    text = f"{title} {description}".strip()
    
    # Fallback if model is not loaded or text is empty
    if not nlp_model or not text:
        text_lower = text.lower()
        if any(kw in text_lower for kw in CRITICAL_KEYWORDS):
            return {"predictedUrgency": "critical", "confidence": 0.8, "score": 8.0, "highDemandSkills": len(required_skills)}
        elif any(kw in text_lower for kw in HIGH_KEYWORDS):
            return {"predictedUrgency": "high", "confidence": 0.7, "score": 5.0, "highDemandSkills": len(required_skills)}
        else:
            return {"predictedUrgency": "medium", "confidence": 0.5, "score": 2.0, "highDemandSkills": len(required_skills)}

    try:
        # Predict class
        prediction = nlp_model.predict([text])[0]
        
        # Get probability (confidence)
        probs = nlp_model.predict_proba([text])[0]
        max_prob = max(probs)
        
        return {
            "predictedUrgency": prediction,
            "confidence": round(float(max_prob), 2),
            "score": round(float(max_prob) * 10, 2),
            "matchedKeywords": {"nlp_mode": ["active"]},  # Kept for frontend compatibility
            "highDemandSkills": len(required_skills),
            "ml_powered": True
        }
    except Exception as e:
        # Final fallback
        return {
            "predictedUrgency": "medium",
            "confidence": 0.5,
            "score": 0.0,
            "highDemandSkills": 0,
            "error": str(e)
        }
