import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Streak, CheckIn } from '@/types';
import { formatDate, calculateStreakLength } from '@/utils/dates';
import Card from '@/components/ui/Card';
import ProgressBar from '@/components/ui/ProgressBar';

interface StreakCardProps {
  streak: Streak;
  checkIns?: CheckIn[];
  onPress?: () => void;
  onCheckIn?: () => void;
}

const StreakCard: React.FC<StreakCardProps> = ({
  streak,
  checkIns = [],
  onPress,
  onCheckIn,
}) => {
  const today = formatDate(new Date(), 'YYYY-MM-DD');
  const checkInDates = checkIns.map(checkIn => checkIn.checkInDate);
  const currentStreak = calculateStreakLength(checkInDates);
  const hasCheckedInToday = checkInDates.includes(today);
  const participantsCount = streak._count?.participants || 0;

  const getStatusColor = () => {
    switch (streak.status) {
      case 'active':
        return '#10b981';
      case 'paused':
        return '#f59e0b';
      case 'completed':
        return '#6366f1';
      default:
        return '#64748b';
    }
  };

  const getTypeIcon = () => {
    switch (streak.type) {
      case 'duo':
        return '👥';
      case 'squad':
        return '👨‍👩‍👧‍👦';
      case 'tribe':
        return '🏘️';
      default:
        return '🔥';
    }
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={styles.icon}>{getTypeIcon()}</Text>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{streak.title}</Text>
              <Text style={styles.category}>{streak.category}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
              <Text style={styles.statusText}>{streak.status}</Text>
            </View>
          </View>
        </View>

        {streak.description && (
          <Text style={styles.description}>{streak.description}</Text>
        )}

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{currentStreak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{participantsCount}</Text>
            <Text style={styles.statLabel}>Members</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{checkIns.length}</Text>
            <Text style={styles.statLabel}>Total Check-ins</Text>
          </View>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressText}>Today's Progress</Text>
            <Text style={styles.progressStatus}>
              {hasCheckedInToday ? '✅ Done' : '⏳ Pending'}
            </Text>
          </View>
          <ProgressBar
            progress={hasCheckedInToday ? 1 : 0}
            showPercentage={false}
            height={6}
          />
        </View>

        {!hasCheckedInToday && onCheckIn && (
          <TouchableOpacity onPress={onCheckIn} style={styles.checkInButton}>
            <LinearGradient
              colors={['#0891b2', '#0e7490']}
              style={styles.checkInGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.checkInText}>Check In Now</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 20,
    marginBottom: 16,
  },
  header: {
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 2,
  },
  category: {
    fontSize: 14,
    color: '#64748b',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
    textTransform: 'capitalize',
  },
  description: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 16,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
  },
  progressStatus: {
    fontSize: 12,
    color: '#64748b',
  },
  checkInButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  checkInGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  checkInText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default StreakCard;