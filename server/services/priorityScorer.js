/**
 * Priority Scorer — Urgency scoring for tasks
 * 
 * Score is used to rank tasks for display and volunteer recommendations.
 */

const URGENCY_WEIGHTS = {
  'low': 1,
  'medium': 2,
  'high': 3,
  'critical': 4
};

/**
 * Calculate priority score for a task
 * @param {Object} task - Task document
 * @returns {Number} Priority score (higher = more urgent)
 */
function calculatePriorityScore(task) {
  let score = 0;

  // 1. Base urgency score (0-4)
  score += URGENCY_WEIGHTS[task.urgency] || 2;

  // 2. Deadline proximity bonus (0-3)
  if (task.deadline) {
    const now = new Date();
    const deadline = new Date(task.deadline);
    const hoursLeft = (deadline - now) / (1000 * 60 * 60);

    if (hoursLeft < 0) {
      score += 3; // Overdue — highest bonus
    } else if (hoursLeft < 24) {
      score += 2.5; // Less than 1 day
    } else if (hoursLeft < 72) {
      score += 1.5; // Less than 3 days
    } else if (hoursLeft < 168) {
      score += 0.5; // Less than 1 week
    }
  }

  // 3. Open duration penalty — tasks sitting open too long get boosted (0-2)
  if (task.createdAt) {
    const ageHours = (Date.now() - new Date(task.createdAt)) / (1000 * 60 * 60);
    if (ageHours > 72) {
      score += 2;
    } else if (ageHours > 24) {
      score += 1;
    } else if (ageHours > 6) {
      score += 0.5;
    }
  }

  // 4. Status penalty — assigned tasks get lower priority
  if (task.status === 'assigned' || task.status === 'in-progress') {
    score -= 1;
  }

  return Math.round(score * 100) / 100;
}

/**
 * Sort tasks by priority score (highest first)
 * @param {Array} tasks - Array of task documents
 * @returns {Array} Sorted tasks with priority scores
 */
function sortByPriority(tasks) {
  return tasks
    .map(task => ({
      task,
      priorityScore: calculatePriorityScore(task)
    }))
    .sort((a, b) => b.priorityScore - a.priorityScore);
}

module.exports = { calculatePriorityScore, sortByPriority };
