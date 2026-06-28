const User = require('../models/User');
const Achievement = require('../models/Achievement');
const Notification = require('../models/Notification');

class AchievementService {
  /**
   * Check and award achievements after a user action
   */
  async checkAndAward(userId, trigger) {
    try {
      const user = await User.findById(userId).populate('achievements.achievementId');
      if (!user) return [];

      const allAchievements = await Achievement.find({ isActive: true });
      const earnedIds = user.achievements.map(a => a.achievementId?._id?.toString());

      const newlyEarned = [];

      for (const achievement of allAchievements) {
        // Skip already earned
        if (earnedIds.includes(achievement._id.toString())) continue;

        const earned = await this.checkCriteria(user, achievement, trigger);
        if (earned) {
          // Award it
          user.achievements.push({ achievementId: achievement._id, earnedAt: new Date() });
          user.points += achievement.pointsReward;
          newlyEarned.push(achievement);

          // Level up check
          user.level = Math.floor(user.points / 500) + 1;

          // Create notification
          await Notification.create({
            recipient: user._id,
            type: 'achievement_earned',
            title: `🏆 Achievement Unlocked: ${achievement.name}`,
            body: `You earned the "${achievement.name}" badge! +${achievement.pointsReward} points`,
            referenceModel: 'Achievement',
            referenceId: achievement._id,
          });
        }
      }

      if (newlyEarned.length > 0) {
        await user.save();
      }

      return newlyEarned;
    } catch (error) {
      console.error('Achievement check error:', error.message);
      return [];
    }
  }

  /**
   * Check if user meets achievement criteria
   */
  async checkCriteria(user, achievement, trigger) {
    const { criteria } = achievement;
    if (!criteria?.type) return false;

    switch (criteria.type) {
      case 'first_exchange':
        return user.totalExchanges >= 1;

      case 'exchanges_completed':
        return user.totalExchanges >= (criteria.threshold || 5);

      case 'sessions_completed':
        return user.totalSessions >= (criteria.threshold || 3);

      case 'reviews_given': {
        const Review = require('../models/Review');
        const count = await Review.countDocuments({ reviewer: user._id });
        return count >= (criteria.threshold || 5);
      }

      case 'rating_threshold':
        return user.averageRating >= (criteria.threshold || 4.5) && user.totalReviews >= 5;

      case 'skills_offered':
        return user.skillsOffered?.length >= (criteria.threshold || 3);

      case 'profile_complete':
        return user.profileCompleteness >= 100;

      case 'skills_learned':
        return user.learningProgress?.filter(lp => lp.progressPercent >= 100).length >= (criteria.threshold || 1);

      default:
        return false;
    }
  }

  /**
   * Seed default achievements into DB
   */
  async seedAchievements() {
    const defaults = [
      {
        name: 'First Steps', description: 'Complete your first skill exchange', icon: '🌱',
        category: 'exchange', tier: 'bronze', pointsReward: 50,
        criteria: { type: 'first_exchange', description: 'Complete 1 exchange' }
      },
      {
        name: 'Skill Sharer', description: 'Complete 5 skill exchanges', icon: '🤝',
        category: 'exchange', tier: 'silver', pointsReward: 150,
        criteria: { type: 'exchanges_completed', threshold: 5, description: 'Complete 5 exchanges' }
      },
      {
        name: 'Exchange Master', description: 'Complete 20 skill exchanges', icon: '🏆',
        category: 'exchange', tier: 'gold', pointsReward: 500,
        criteria: { type: 'exchanges_completed', threshold: 20, description: 'Complete 20 exchanges' }
      },
      {
        name: 'Knowledge Seeker', description: 'Complete 3 learning sessions', icon: '📚',
        category: 'learning', tier: 'bronze', pointsReward: 75,
        criteria: { type: 'sessions_completed', threshold: 3 }
      },
      {
        name: 'Top Rated', description: 'Achieve 4.5+ star average rating', icon: '⭐',
        category: 'social', tier: 'gold', pointsReward: 300,
        criteria: { type: 'rating_threshold', threshold: 4.5 }
      },
      {
        name: 'Skill Collector', description: 'Add 5+ skills to your profile', icon: '🎯',
        category: 'milestone', tier: 'silver', pointsReward: 100,
        criteria: { type: 'skills_offered', threshold: 5 }
      },
      {
        name: 'Complete Profile', description: 'Fill out your profile 100%', icon: '✅',
        category: 'milestone', tier: 'bronze', pointsReward: 50,
        criteria: { type: 'profile_complete' }
      },
      {
        name: 'Giving Back', description: 'Write reviews for 5 exchanges', icon: '💬',
        category: 'social', tier: 'silver', pointsReward: 100,
        criteria: { type: 'reviews_given', threshold: 5 }
      },
      {
        name: 'Skill Master', description: 'Complete learning a skill (100% progress)', icon: '🎓',
        category: 'learning', tier: 'gold', pointsReward: 250,
        criteria: { type: 'skills_learned', threshold: 1 }
      },
    ];

    for (const achievement of defaults) {
      await Achievement.findOneAndUpdate(
        { name: achievement.name },
        achievement,
        { upsert: true, new: true }
      );
    }
    console.log('✅ Default achievements seeded');
  }
}

module.exports = new AchievementService();
