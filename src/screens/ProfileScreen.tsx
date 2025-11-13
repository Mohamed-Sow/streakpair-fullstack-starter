import React, { useMemo, useState, useCallback } from "react";
import { View, Text, Pressable, ScrollView, Alert, RefreshControl } from "react-native";
import { User, Flame, Target, TrendingUp, LogOut, Trophy, Award, Calendar, BarChart3 } from "lucide-react-native";
import type { BottomTabScreenProps } from "@/navigation/types";
import { useSession } from "@/lib/useSession";
import { authClient } from "@/lib/authClient";
import { useStreaksStore } from "@/state/streaksStore";
import { api } from "@/lib/api";
import type { GetStreaksResponse } from "@/shared/contracts";

type Props = BottomTabScreenProps<"ProfileTab">;

const ProfileScreen = ({ navigation }: Props) => {
  const { data: session } = useSession();
  const streaks = useStreaksStore((s) => s.streaks);
  const setStreaks = useStreaksStore((s) => s.setStreaks);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    if (!session) return;
    setRefreshing(true);
    try {
      const response = await api.get<GetStreaksResponse>("/api/streaks");
      setStreaks(response.streaks);
    } catch (error) {
      console.error("Failed to refresh streaks:", error);
    } finally {
      setRefreshing(false);
    }
  }, [session, setStreaks]);

  // Calculate user stats
  const stats = useMemo(() => {
    if (!session)
      return {
        totalStreaks: 0,
        totalCheckIns: 0,
        longestStreak: 0,
        activeStreaks: 0,
        weeklyAverage: 0,
        monthlyConsistency: 0,
      };

    const totalStreaks = streaks.length;
    const activeStreaks = streaks.filter((s) => s.isActive).length;

    let totalCheckIns = 0;
    let longestStreak = 0;

    // Calculate weekly and monthly consistency
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    let weeklyCheckIns = 0;
    let monthlyCheckIns = 0;

    streaks.forEach((streak) => {
      const userCheckIns = streak.checkIns.filter((c) => c.userId === session.user.id);
      totalCheckIns += userCheckIns.length;

      // Count check-ins in last 7 days
      weeklyCheckIns += userCheckIns.filter((c) => {
        const checkInDate = new Date(c.date);
        return checkInDate >= sevenDaysAgo;
      }).length;

      // Count check-ins in last 30 days
      monthlyCheckIns += userCheckIns.filter((c) => {
        const checkInDate = new Date(c.date);
        return checkInDate >= thirtyDaysAgo;
      }).length;

      // Calculate longest streak for this streak
      const dates = userCheckIns.map((c) => c.date).sort();
      let currentStreak = 0;
      let maxStreak = 0;

      for (let i = 0; i < dates.length; i++) {
        if (i === 0) {
          currentStreak = 1;
        } else {
          const prevDate = new Date(dates[i - 1]);
          const currDate = new Date(dates[i]);
          const diffDays = Math.floor(
            (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (diffDays === 1) {
            currentStreak++;
          } else {
            currentStreak = 1;
          }
        }
        maxStreak = Math.max(maxStreak, currentStreak);
      }

      longestStreak = Math.max(longestStreak, maxStreak);
    });

    const weeklyAverage = Math.round((weeklyCheckIns / 7) * 10) / 10;
    const monthlyConsistency = Math.round((monthlyCheckIns / 30) * 100);

    return {
      totalStreaks,
      totalCheckIns,
      longestStreak,
      activeStreaks,
      weeklyAverage,
      monthlyConsistency,
    };
  }, [streaks, session]);

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await authClient.signOut();
          navigation.navigate("HomeTab");
        },
      },
    ]);
  };

  if (!session) {
    return (
      <View style={{ flex: 1, backgroundColor: "#FAFAFA" }} className="items-center justify-center p-6">
        <View
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: "#FFF",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 24,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 12,
            elevation: 3,
          }}
        >
          <User color="#6B7280" size={50} />
        </View>
        <Text className="text-2xl font-bold text-gray-900 mb-2">Not Signed In</Text>
        <Text className="text-base text-gray-500 text-center mb-8 px-8">
          Sign in to track your progress and view your stats
        </Text>
        <Pressable
          onPress={() => navigation.navigate("AuthScreen")}
          className="bg-gray-900 px-8 py-4 rounded-2xl active:opacity-80"
        >
          <Text className="text-white font-semibold text-base">Sign In</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#FAFAFA" }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FF6B35"
            colors={["#FF6B35"]}
          />
        }
      >
        {/* Profile Header */}
        <View style={{ backgroundColor: "#FFF", padding: 20, paddingTop: 80, paddingBottom: 32 }}>
          <View className="items-center">
            <View
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: "#000",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
              }}
            >
              <Text style={{ fontSize: 40, color: "#fff", fontWeight: "700" }}>
                {session.user.name?.charAt(0).toUpperCase() || "?"}
              </Text>
            </View>
            <Text className="text-3xl font-bold text-gray-900 mb-2">{session.user.name}</Text>
            <Text className="text-base text-gray-500">{session.user.email}</Text>
          </View>
        </View>

        <View className="p-5">
          {/* Consistency Overview */}
          <View className="mb-6">
            <Text className="text-xl font-bold text-gray-900 mb-4">Your Consistency</Text>
            <View className="bg-white rounded-3xl p-6">
              <View className="items-center mb-6">
                <Text className="text-6xl font-bold text-gray-900 mb-2">
                  {stats.monthlyConsistency}%
                </Text>
                <Text className="text-base text-gray-500 font-medium">30-day consistency rate</Text>
              </View>

              {/* Consistency Bar */}
              <View
                style={{
                  height: 12,
                  backgroundColor: "#E5E7EB",
                  borderRadius: 6,
                  overflow: "hidden",
                  marginBottom: 16,
                }}
              >
                <View
                  style={{
                    width: `${stats.monthlyConsistency}%`,
                    height: "100%",
                    backgroundColor:
                      stats.monthlyConsistency >= 70
                        ? "#00D9A5"
                        : stats.monthlyConsistency >= 40
                          ? "#FFA500"
                          : "#EF4444",
                  }}
                />
              </View>

              {/* Mini Stats */}
              <View className="flex-row justify-around pt-4 border-t border-gray-100">
                <View className="items-center">
                  <Text className="text-2xl font-bold text-gray-900 mb-1">
                    {stats.weeklyAverage}
                  </Text>
                  <Text className="text-xs text-gray-500 font-medium">Avg/Day (7d)</Text>
                </View>
                <View className="items-center">
                  <Text className="text-2xl font-bold text-gray-900 mb-1">
                    {stats.totalCheckIns}
                  </Text>
                  <Text className="text-xs text-gray-500 font-medium">Total Check-ins</Text>
                </View>
                <View className="items-center">
                  <Text className="text-2xl font-bold text-gray-900 mb-1">{stats.longestStreak}</Text>
                  <Text className="text-xs text-gray-500 font-medium">Best Streak</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Stats Grid */}
          <View className="mb-6">
            <Text className="text-xl font-bold text-gray-900 mb-4">Stats</Text>
            <View className="flex-row gap-3 mb-3">
              <View className="flex-1 bg-white rounded-2xl p-5">
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: "#FFF3ED",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                  }}
                >
                  <Flame color="#FF6B35" size={26} />
                </View>
                <Text className="text-3xl font-bold text-gray-900 mb-1">
                  {stats.activeStreaks}
                </Text>
                <Text className="text-sm text-gray-500 font-medium">Active Streaks</Text>
              </View>

              <View className="flex-1 bg-white rounded-2xl p-5">
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: "#EDE9FE",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                  }}
                >
                  <Calendar color="#6C5CE7" size={26} />
                </View>
                <Text className="text-3xl font-bold text-gray-900 mb-1">
                  {stats.totalStreaks}
                </Text>
                <Text className="text-sm text-gray-500 font-medium">Total Streaks</Text>
              </View>
            </View>
          </View>

          {/* Insights Button */}
          <View className="mb-6">
            <Pressable
              onPress={() => navigation.navigate("InsightsScreen")}
              className="active:opacity-90"
            >
              <View
                style={{
                  backgroundColor: "#FFF",
                  borderRadius: 20,
                  padding: 18,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: "#EDE9FE",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 16,
                  }}
                >
                  <BarChart3 color="#9333EA" size={22} />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-bold text-gray-900 mb-0.5">
                    View Insights
                  </Text>
                  <Text className="text-sm text-gray-500">
                    Detailed progress and trends
                  </Text>
                </View>
              </View>
            </Pressable>
          </View>

          {/* Achievements */}
          <View className="mb-6">
            <Text className="text-xl font-bold text-gray-900 mb-4">Achievements</Text>
            <View
              style={{
                backgroundColor:
                  stats.totalCheckIns >= 100
                    ? "#FFF7ED"
                    : stats.totalCheckIns >= 50
                      ? "#FEF3C7"
                      : "#F3F4F6",
                borderRadius: 24,
                padding: 20,
                borderWidth: 2,
                borderColor:
                  stats.totalCheckIns >= 100
                    ? "#FDBA74"
                    : stats.totalCheckIns >= 50
                      ? "#FCD34D"
                      : "#E5E7EB",
              }}
            >
              <View className="flex-row items-center">
                <View
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    backgroundColor:
                      stats.totalCheckIns >= 100
                        ? "#FB923C"
                        : stats.totalCheckIns >= 50
                          ? "#F59E0B"
                          : "#9CA3AF",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 16,
                  }}
                >
                  {stats.totalCheckIns >= 100 ? (
                    <Award color="#fff" size={36} />
                  ) : stats.totalCheckIns >= 50 ? (
                    <Trophy color="#fff" size={36} />
                  ) : (
                    <Target color="#fff" size={36} />
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-xl font-bold text-gray-900 mb-2">
                    {stats.totalCheckIns >= 100
                      ? "Century Club"
                      : stats.totalCheckIns >= 50
                        ? "Half Century"
                        : stats.totalCheckIns >= 10
                          ? "Getting Started"
                          : "Just Beginning"}
                  </Text>
                  <Text className="text-sm text-gray-600 leading-5">
                    {stats.totalCheckIns >= 100
                      ? "Amazing! You've completed over 100 check-ins. You're a consistency master!"
                      : stats.totalCheckIns >= 50
                        ? "Impressive! You've hit 50+ check-ins. Keep up the great work!"
                        : stats.totalCheckIns >= 10
                          ? "Great start! You've completed 10+ check-ins. Build that momentum!"
                          : "Welcome! Complete your first 10 check-ins to unlock your first achievement."}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Account Actions */}
          <View>
            <Text className="text-xl font-bold text-gray-900 mb-4">Account</Text>
            <Pressable onPress={handleSignOut} className="active:opacity-90">
              <View
                style={{
                  backgroundColor: "#FFF",
                  borderRadius: 20,
                  padding: 18,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: "#FEE2E2",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 16,
                  }}
                >
                  <LogOut color="#EF4444" size={22} />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-bold text-gray-900 mb-0.5">Sign Out</Text>
                  <Text className="text-sm text-gray-500">Sign out of your account</Text>
                </View>
              </View>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;
