/**
 * Matching Engine — Rule-based volunteer-task matching
 * 
 * Composite Score = 0.5 × skillScore + 0.3 × locationScore + 0.2 × availabilityScore
 */

// Haversine distance in km
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Jaccard similarity between two arrays
function jaccardSimilarity(arr1, arr2) {
  const set1 = new Set(arr1.map(s => s.toLowerCase()));
  const set2 = new Set(arr2.map(s => s.toLowerCase()));
  const intersection = [...set1].filter(x => set2.has(x));
  const union = new Set([...set1, ...set2]);
  return union.size === 0 ? 0 : intersection.length / union.size;
}

// Skill match score (0-1)
function getSkillScore(volunteerSkills, taskSkills) {
  return jaccardSimilarity(volunteerSkills, taskSkills);
}

// Location score (0-1) — closer = higher score, max 100km radius
function getLocationScore(volunteerLoc, taskLoc) {
  if (!volunteerLoc.lat || !taskLoc.lat) return 0.5; // if no location, neutral score
  const distance = haversineDistance(
    volunteerLoc.lat, volunteerLoc.lng,
    taskLoc.lat, taskLoc.lng
  );
  const maxDistance = 100; // 100km
  return Math.max(0, 1 - distance / maxDistance);
}

// Availability score (0-1)
function getAvailabilityScore(availability) {
  const scores = {
    'full-time': 1.0,
    'part-time': 0.7,
    'weekends': 0.4,
    'not-available': 0
  };
  return scores[availability] || 0;
}

/**
 * Match volunteers to a task
 * @param {Object} task - Task document
 * @param {Array} volunteers - Array of volunteer documents
 * @param {Number} topN - Number of top matches to return
 * @returns {Array} Ranked list of { volunteer, score, breakdown }
 */
function matchVolunteersToTask(task, volunteers, topN = 5) {
  const results = volunteers
    .filter(v => v.availability !== 'not-available')
    .map(volunteer => {
      const skillScore = getSkillScore(volunteer.skills, task.requiredSkills);
      const locationScore = getLocationScore(volunteer.location, task.location);
      const availabilityScore = getAvailabilityScore(volunteer.availability);

      const compositeScore =
        0.5 * skillScore +
        0.3 * locationScore +
        0.2 * availabilityScore;

      return {
        volunteer,
        score: Math.round(compositeScore * 100) / 100,
        breakdown: {
          skill: Math.round(skillScore * 100) / 100,
          location: Math.round(locationScore * 100) / 100,
          availability: Math.round(availabilityScore * 100) / 100
        }
      };
    });

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, topN);
}

module.exports = { matchVolunteersToTask, haversineDistance, jaccardSimilarity };
