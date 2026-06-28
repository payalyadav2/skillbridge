const User = require('../models/User');

class MatchingService {
  /**
   * Find compatible users for skill exchange
   * @param {Object} currentUser - The user looking for matches
   * @param {Object} options - Filter options
   * @returns {Array} Sorted list of potential matches with scores
   */
  async findMatches(currentUser, options = {}) {
    const {
      maxDistance = currentUser.preferences?.maxDistance || 50,
      limit = 20,
      page = 1,
      category = null,
    } = options;

    const wantedSkillNames = currentUser.skillsWanted?.map(s => s.name.toLowerCase()) || [];
    const offeredSkillNames = currentUser.skillsOffered?.map(s => s.name.toLowerCase()) || [];

    if (wantedSkillNames.length === 0 && offeredSkillNames.length === 0) {
      return { matches: [], total: 0 };
    }

    // Build query
    const query = {
      _id: { $ne: currentUser._id },
      isActive: true,
      isBanned: false,
      'preferences.isProfilePublic': true,
    };

    // Geo filter if user has location
    if (
      currentUser.location?.coordinates &&
      currentUser.location.coordinates[0] !== 0 &&
      currentUser.location.coordinates[1] !== 0
    ) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: currentUser.location.coordinates,
          },
          $maxDistance: maxDistance * 1000, // convert km to meters
        },
      };
    }

    // Category filter
    if (category) {
      query.$or = [
        { 'skillsOffered.category': category },
        { 'skillsWanted.category': category },
      ];
    }

    const users = await User.find(query)
      .select('name avatar bio skillsOffered skillsWanted location experienceLevel averageRating totalReviews totalExchanges isOnline lastSeen preferences')
      .limit(limit * 3) // Get more to filter and score
      .lean();

    // Score each potential match
    const scoredMatches = users
      .map(user => {
        const score = this.calculateMatchScore(currentUser, user);
        return { ...user, matchScore: score.total, matchReasons: score.reasons };
      })
      .filter(user => user.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice((page - 1) * limit, page * limit);

    return {
      matches: scoredMatches,
      total: scoredMatches.length,
    };
  }

  /**
   * Calculate match score between two users
   * Score components:
   * - Skill complement (primary): 50 pts
   * - Rating: 20 pts
   * - Activity: 15 pts
   * - Experience level: 15 pts
   */
  calculateMatchScore(user, candidate) {
    let total = 0;
    const reasons = [];

    const myWants = user.skillsWanted?.map(s => s.name.toLowerCase()) || [];
    const myOffers = user.skillsOffered?.map(s => s.name.toLowerCase()) || [];
    const theirOffers = candidate.skillsOffered?.map(s => s.name.toLowerCase()) || [];
    const theirWants = candidate.skillsWanted?.map(s => s.name.toLowerCase()) || [];

    // ── Skill complementarity ────────────────────────────────────────────────
    const theyCanTeachMe = myWants.filter(w => 
      theirOffers.some(o => o.includes(w) || w.includes(o))
    );
    const iCanTeachThem = myOffers.filter(o => 
      theirWants.some(w => w.includes(o) || o.includes(w))
    );

    const complementScore = (theyCanTeachMe.length * 20) + (iCanTeachThem.length * 20);
    total += Math.min(50, complementScore);

    if (theyCanTeachMe.length > 0) {
      reasons.push(`Can teach you: ${theyCanTeachMe.slice(0, 2).join(', ')}`);
    }
    if (iCanTeachThem.length > 0) {
      reasons.push(`Wants to learn: ${iCanTeachThem.slice(0, 2).join(', ')}`);
    }

    // ── Rating score ─────────────────────────────────────────────────────────
    if (candidate.averageRating) {
      const ratingScore = (candidate.averageRating / 5) * 20;
      total += ratingScore;
      if (candidate.averageRating >= 4) reasons.push(`Highly rated (${candidate.averageRating}★)`);
    }

    // ── Activity score ────────────────────────────────────────────────────────
    if (candidate.isOnline) {
      total += 15;
      reasons.push('Currently online');
    } else if (candidate.lastSeen) {
      const hoursSinceActive = (Date.now() - new Date(candidate.lastSeen)) / (1000 * 60 * 60);
      if (hoursSinceActive < 24) {
        total += 10;
        reasons.push('Active today');
      } else if (hoursSinceActive < 168) {
        total += 5;
        reasons.push('Active this week');
      }
    }

    // ── Experience level score ────────────────────────────────────────────────
    const levels = ['student', 'beginner', 'intermediate', 'advanced', 'expert', 'professional'];
    const myLevelIndex = levels.indexOf(user.experienceLevel);
    const theirLevelIndex = levels.indexOf(candidate.experienceLevel);
    const levelDiff = Math.abs(myLevelIndex - theirLevelIndex);
    const levelScore = Math.max(0, 15 - levelDiff * 3);
    total += levelScore;

    return { total: Math.round(total), reasons };
  }

  /**
   * Get recommended users to send exchange requests to
   */
  async getRecommendedUsers(userId, limit = 6) {
    const User = require('../models/User');
    const user = await User.findById(userId);
    if (!user) return [];

    const { matches } = await this.findMatches(user, { limit });
    return matches.slice(0, limit);
  }
}

module.exports = new MatchingService();
