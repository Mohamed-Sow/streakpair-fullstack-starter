import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { streaksService } from '@/services';
import { AppError, getErrorMessage } from '@/utils/errors';
import StreakCard from '@/components/streaks/StreakCard';
import CheckInModal from '@/components/streaks/CheckInModal';
import { Streak, CheckIn } from '@/types';

const DashboardScreen: React.FC = () => {
  const { user } = useAuthStore();
  const [streaks, setStreaks] = useState<Streak[]>([]);
  const [checkIns, setCheckIns] = useState<{ [key: string]: CheckIn[] }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [checkInModalVisible, setCheckInModalVisible] = useState(false);
  const [selectedStreak, setSelectedStreak] = useState<Streak | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const streaksData = await streaksService.getStreaks();

      // Load check-ins for each streak
      const checkInsMap: { [key: string]: CheckIn[] } = {};
      for (const streak of streaksData) {
        try {
          const checkInsData = await streaksService.getCheckIns(streak.id);
          checkInsMap[streak.id] = checkInsData;
        } catch (error) {
          console.warn(`Failed to load check-ins for streak ${streak.id}:`, error);
          checkInsMap[streak.id] = [];
        }
      }

      setStreaks(streaksData);
      setCheckIns(checkInsMap);

    } catch (error) {
      const appError = error as AppError;
      Alert.alert('Error', getErrorMessage(appError));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleCheckIn = (streak: Streak) => {
    setSelectedStreak(streak);
    setCheckInModalVisible(true);
  };

  const handleCheckInSubmit = async (proofText: string, proofImage?: string) => {
    if (!selectedStreak) return;

    try {
      await streaksService.createCheckIn(selectedStreak.id, {
        proofText,
        proofImage: proofImage as any, // Type assertion for file upload
      });

      // Reload dashboard data
      await loadDashboardData();
    } catch (error) {
      const appError = error as AppError;
      throw appError; // Re-throw to show in modal
    }
  };

  const activeStreaks = streaks.filter(streak => streak.status === 'active');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>
          Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋
        </Text>
        <Text style={styles.subtitle}>
          You have {activeStreaks.length} active {activeStreaks.length === 1 ? 'streak' : 'streaks'}
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {activeStreaks.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>🎯</Text>
            <Text style={styles.emptyStateTitle}>No Active Streaks</Text>
            <Text style={styles.emptyStateSubtitle}>
              Join or create a streak to start building accountability!
            </Text>
          </View>
        ) : (
          activeStreaks.map((streak) => (
            <StreakCard
              key={streak.id}
              streak={streak}
              checkIns={checkIns[streak.id] || []}
              onPress={() => {
                // TODO: Navigate to streak details
                Alert.alert('Streak Details', 'Streak details screen coming soon!');
              }}
              onCheckIn={() => handleCheckIn(streak)}
            />
          ))
        )}
      </ScrollView>

      <CheckInModal
        visible={checkInModalVisible}
        onClose={() => {
          setCheckInModalVisible(false);
          setSelectedStreak(null);
        }}
        onSubmit={handleCheckInSubmit}
        streakTitle={selectedStreak?.title}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    paddingBottom: 12,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default DashboardScreen;