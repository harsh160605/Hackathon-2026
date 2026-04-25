"""
ML-based Matching Engine
Uses scikit-learn for skill vectorization and cosine similarity
"""
import math
import os
import joblib
from typing import List

# Load the newly trained model
current_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(current_dir, "..", "model.pkl")

try:
    match_model = joblib.load(model_path)
except Exception as e:
    print(f"Warning: Could not load model from {model_path}: {e}")
    match_model = None

# Mappings based on the trained model
skill_map = {"medical": 0, "teaching": 1, "food": 2, "rescue": 3}
location_map = {"pune": 0, "mumbai": 1, "nashik": 2}
urgency_map = {"low": 0, "medium": 1, "high": 2}
availability_map = {"no": 0, "yes": 1}

def get_ml_prediction(volunteer, task):
    if not match_model:
        return 0.5  # Fallback score if model is not loaded
    
    # Safely extract features
    vol_skill_str = volunteer.skills[0].lower() if volunteer.skills else "medical"
    task_skill_str = task.requiredSkills[0].lower() if task.requiredSkills else "medical"
    
    vol_loc_str = volunteer.location.city.lower() if volunteer.location.city else "pune"
    task_loc_str = task.location.city.lower() if task.location.city else "pune"
    
    availability_str = "no" if volunteer.availability == "not-available" else "yes"
    urgency_str = task.urgency.lower() if task.urgency else "medium"

    # Map to integers using maps (with fallbacks if key not found)
    vs = skill_map.get(vol_skill_str, 0)
    ts = skill_map.get(task_skill_str, 0)
    vl = location_map.get(vol_loc_str, 0)
    tl = location_map.get(task_loc_str, 0)
    av = availability_map.get(availability_str, 1)
    ur = urgency_map.get(urgency_str, 1)
    
    data = [[vs, vl, av, ts, tl, ur]]
    
    try:
        # Get probability of match (class 1)
        prob = match_model.predict_proba(data)[0][1]
        return prob
    except Exception:
        # Fallback if predict_proba fails
        try:
            return float(match_model.predict(data)[0])
        except:
            return 0.5

def haversine_distance(lat1, lon1, lat2, lon2):
    """Calculate Haversine distance in km"""
    R = 6371
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (math.sin(d_lat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(d_lon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def jaccard_similarity(set1, set2):
    """Jaccard similarity coefficient"""
    s1 = set(s.lower() for s in set1)
    s2 = set(s.lower() for s in set2)
    if not s1 and not s2:
        return 0.0
    intersection = s1 & s2
    union = s1 | s2
    return len(intersection) / len(union) if union else 0.0

def skill_score(volunteer_skills, task_skills):
    return jaccard_similarity(volunteer_skills, task_skills)

def location_score(v_loc, t_loc):
    if not v_loc.lat or not t_loc.lat:
        return 0.5
    dist = haversine_distance(v_loc.lat, v_loc.lng, t_loc.lat, t_loc.lng)
    return max(0.0, 1.0 - dist / 100.0)

def availability_score(availability):
    scores = {
        "full-time": 1.0,
        "part-time": 0.7,
        "weekends": 0.4,
        "not-available": 0.0,
    }
    return scores.get(availability, 0.0)

def match_volunteers_to_task(task, volunteers, top_n=5):
    """
    Match and rank volunteers for a given task.
    Composite combines the new ML prediction with traditional heuristics.
    """
    results = []

    for v in volunteers:
        if v.availability == "not-available":
            continue

        s_score = skill_score(v.skills, task.requiredSkills)
        l_score = location_score(v.location, task.location)
        a_score = availability_score(v.availability)
        
        # New ML Prediction Score
        ml_score = get_ml_prediction(v, task)

        # Composite = 50% ML Model + 20% Skill + 15% Location + 15% Availability
        composite = 0.5 * ml_score + 0.2 * s_score + 0.15 * l_score + 0.15 * a_score

        results.append({
            "volunteerId": v.id,
            "name": v.name,
            "skills": v.skills,
            "location": {"lat": v.location.lat, "lng": v.location.lng, "city": v.location.city},
            "availability": v.availability,
            "rating": v.rating,
            "score": round(composite, 3),
            "breakdown": {
                "ml_prediction": round(ml_score, 3),
                "skill": round(s_score, 3),
                "location": round(l_score, 3),
                "availability": round(a_score, 3),
            },
        })

    results.sort(key=lambda x: x["score"], reverse=True)
    return results[:top_n]
