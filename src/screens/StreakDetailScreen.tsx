import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Share,
  Alert,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Flame,
  Users,
  Calendar as CalendarIcon,
  Share2,
  Camera,
  CheckCircle2,
  TrendingUp,
  Award,
  ArrowLeft,
  Trophy,
  DollarSign,
  Clock,
  Target,
  Image as ImageIcon,
} from "lucide-react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { RootStackScreenProps } from "@/navigation/types";
import { useSession } from "@/lib/useSession";
import { api } from "@/lib/api";
import type { GetStreakDetailsResponse } from "@/shared/contracts";

type Props = RootStackScreenProps<"StreakDetailScreen">;

const StreakDetailScreen = ({ route, navigation }: Props) => {
  const { streakId } = route.params;
  const { data: session } = useSession();
  const [streak, setStreak] = useState<
    NonNullable<GetStreakDetailsResponse["streak"]> | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchStreakDetails();
  }, [streakId]);

  // Refresh when screen comes into focus (e.g., after check-in)
  useFocusEffect(
    useCallback(() => {
      fetchStreakDetails();
    }, [streakId])
  );

  const fetchStreakDetails = async () => {
    try {
      setIsLoading(true);
      const response = await api.get<GetStreakDetailsResponse>(`/api/streaks/${streakId}`);
      if (response.success && response.streak) {
        setStreak(response.streak);
      }
    } catch (error) {
      console.error("Failed to fetch streak details:", error);
      Alert.alert("Error", "Failed to load streak details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    if (!streak) return;
    try {
      await Share.share({
        message: `Join my "${streak.name}" streak on StreakPair!\n\nInvite Code: ${streak.inviteCode}`,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleCheckIn = () => {
    navigation.navigate("CheckInScreen", { streakId });
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const response = await api.get<GetStreakDetailsResponse>(`/api/streaks/${streakId}`);
      if (response.success && response.streak) {
        setStreak(response.streak);
      }
    } catch (error) {
      console.error("Failed to refresh streak details:", error);
    } finally {
      setRefreshing(false);
    }
  }, [streakId]);

  // Calculate partner stats for leaderboard
  const partnerStats = useMemo(() => {
    if (!streak) return [];

    return streak.members.map((member) => {
      const memberCheckIns = streak.checkIns.filter((c) => c.userId === member.userId);
      const totalCheckIns = memberCheckIns.length;

      // Calculate last 30 days consistency
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);

      const recentCheckIns = memberCheckIns.filter((c) => {
        const checkInDate = new Date(c.date);
        return checkInDate >= thirtyDaysAgo && checkInDate <= today;
      });

      const consistencyPercentage = Math.round((recentCheckIns.length / 30) * 100);

      // Check if checked in today
      const todayStr = new Date().toISOString().split("T")[0];
      const checkedInToday = streak.checkIns.some(
        (c) => c.userId === member.userId && c.date === todayStr
      );

      // Calculate current streak
      const dates = memberCheckIns
        .map((c) => c.date)
        .sort()
        .reverse();
      let currentStreak = 0;

      if (dates.length > 0) {
        const mostRecentDate = dates[0];
        const daysSinceLastCheckIn = Math.floor(
          (new Date(todayStr).getTime() - new Date(mostRecentDate).getTime()) /
            (1000 * 60 * 60 * 24)
        );

        if (daysSinceLastCheckIn <= 1) {
          currentStreak = 1;
          for (let i = 1; i < dates.length; i++) {
            const prevDate = new Date(dates[i - 1]);
            const currDate = new Date(dates[i]);
            const diff = Math.floor(
              (prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24)
            );

            if (diff === 1) {
              currentStreak++;
            } else {
              break;
            }
          }
        }
      }

      return {
        member,
        totalCheckIns,
        consistencyPercentage,
        checkedInToday,
        currentStreak,
      };
    });
  }, [streak]);

  // Sort by consistency percentage for leaderboard
  const sortedPartnerStats = useMemo(() => {
    return [...partnerStats].sort((a, b) => b.consistencyPercentage - a.consistencyPercentage);
  }, [partnerStats]);

  // Calculate calendar data for the last 7 weeks
  const calendarData = useMemo(() => {
    if (!streak || !session) return [];

    const today = new Date();
    const weeks: Array<Array<{ date: string; hasCheckIn: boolean; isToday: boolean }>> = [];

    // Get last 49 days (7 weeks)
    for (let week = 6; week >= 0; week--) {
      const weekData: Array<{ date: string; hasCheckIn: boolean; isToday: boolean }> = [];
      for (let day = 6; day >= 0; day--) {
        const currentDate = new Date(today);
        currentDate.setDate(today.getDate() - (week * 7 + day));
        const dateStr = currentDate.toISOString().split("T")[0];

        const hasCheckIn = streak.checkIns.some(
          (c) => c.userId === session.user.id && c.date === dateStr
        );

        const todayStr = new Date().toISOString().split("T")[0];
        weekData.push({
          date: dateStr,
          hasCheckIn,
          isToday: dateStr === todayStr,
        });
      }
      weeks.push(weekData.reverse());
    }

    return weeks.reverse();
  }, [streak, session]);

  // Calculate stats
  const myStats = useMemo(() => {
    if (!streak || !session) return { currentStreak: 0, totalCheckIns: 0, completionRate: 0 };

    const userCheckIns = streak.checkIns.filter((c) => c.userId === session.user.id);
    const totalCheckIns = userCheckIns.length;

    // Calculate current streak
    const dates = userCheckIns
      .map((c) => c.date)
      .sort()
      .reverse();
    let currentStreak = 0;
    const today = new Date().toISOString().split("T")[0];

    if (dates.length > 0) {
      const mostRecentDate = dates[0];
      const daysSinceLastCheckIn = Math.floor(
        (new Date(today).getTime() - new Date(mostRecentDate).getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceLastCheckIn <= 1) {
        currentStreak = 1;
        for (let i = 1; i < dates.length; i++) {
          const prevDate = new Date(dates[i - 1]);
          const currDate = new Date(dates[i]);
          const diff = Math.floor((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24));

          if (diff === 1) {
            currentStreak++;
          } else {
            break;
          }
        }
      }
    }

    // Calculate completion rate (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split("T")[0];
    });
    const checkInsLast7Days = userCheckIns.filter((c) => last7Days.includes(c.date)).length;
    const completionRate = Math.round((checkInsLast7Days / 7) * 100);

    return { currentStreak, totalCheckIns, completionRate };
  }, [streak, session]);

  const todayCheckedIn = useMemo(() => {
    if (!streak || !session) return false;
    const today = new Date().toISOString().split("T")[0];
    return streak.checkIns.some((c) => c.userId === session.user.id && c.date === today);
  }, [streak, session]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#FAFAFA" }} className="items-center justify-center">
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  if (!streak) {
    return (
      <View style={{ flex: 1, backgroundColor: "#FAFAFA" }} className="items-center justify-center p-6">
        <Text className="text-xl font-bold text-gray-900">Streak not found</Text>
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
        {/* Header */}
        <View style={{ backgroundColor: "#FFF", padding: 20, paddingTop: 60 }}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={{
              position: "absolute",
              top: 60,
              left: 20,
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "#F8F9FA",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ArrowLeft color="#000" size={20} />
          </Pressable>
          <Pressable
            onPress={handleShare}
            style={{
              position: "absolute",
              top: 60,
              right: 20,
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "#F8F9FA",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Share2 color="#000" size={18} />
          </Pressable>

          <View className="items-center mt-8">
            {streak.emoji && (
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: "#F8F9FA",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <Text style={{ fontSize: 40 }}>{streak.emoji}</Text>
              </View>
            )}
            <Text className="text-3xl font-bold text-gray-900 mb-2 text-center">
              {streak.name}
            </Text>
            {streak.description && (
              <Text className="text-base text-gray-500 text-center">{streak.description}</Text>
            )}
          </View>

          {/* Quick Stats */}
          <View className="flex-row gap-3 mt-8">
            <View className="flex-1 bg-gray-50 rounded-2xl p-4 items-center">
              <Flame color="#FF6B35" size={24} style={{ marginBottom: 8 }} />
              <Text className="text-2xl font-bold text-gray-900">{myStats.currentStreak}</Text>
              <Text className="text-xs text-gray-500 font-medium">Day Streak</Text>
            </View>
            <View className="flex-1 bg-gray-50 rounded-2xl p-4 items-center">
              <CheckCircle2 color="#00D9A5" size={24} style={{ marginBottom: 8 }} />
              <Text className="text-2xl font-bold text-gray-900">{myStats.totalCheckIns}</Text>
              <Text className="text-xs text-gray-500 font-medium">Check-ins</Text>
            </View>
            <View className="flex-1 bg-gray-50 rounded-2xl p-4 items-center">
              <TrendingUp
                color={myStats.completionRate >= 70 ? "#00D9A5" : "#6B7280"}
                size={24}
                style={{ marginBottom: 8 }}
              />
              <Text className="text-2xl font-bold text-gray-900">{myStats.completionRate}%</Text>
              <Text className="text-xs text-gray-500 font-medium">This Week</Text>
            </View>
          </View>
        </View>

        <View className="p-5">
          {/* Competition Info */}
          {streak.isCompetition && (
            <View className="mb-6">
              <View
                style={{
                  backgroundColor: "#FFD700",
                  borderRadius: 24,
                  padding: 20,
                  marginBottom: 16,
                }}
              >
                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-row items-center gap-3">
                    <View
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                        backgroundColor: "#000",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Trophy color="#FFD700" size={26} />
                    </View>
                    <View>
                      <Text className="text-black text-xl font-bold">Competition Mode</Text>
                      <Text className="text-black/70 text-sm font-medium">
                        {streak.competitionType === "duo"
                          ? "1v1 Battle"
                          : streak.competitionType === "team"
                            ? "Team Challenge"
                            : "Free-for-All"}
                      </Text>
                    </View>
                  </View>
                </View>

                <View className="flex-row gap-3">
                  {streak.punishment === "monetary" && streak.rewardPool > 0 && (
                    <View className="flex-1 bg-black rounded-2xl p-4 items-center">
                      <DollarSign color="#FFD700" size={24} style={{ marginBottom: 8 }} />
                      <Text className="text-3xl font-bold text-white">
                        ${streak.rewardPool.toFixed(0)}
                      </Text>
                      <Text className="text-xs text-white/70 font-medium">Prize Pool</Text>
                    </View>
                  )}
                  {streak.endDate && (
                    <View
                      className="flex-1 rounded-2xl p-4 items-center"
                      style={{ backgroundColor: "rgba(0,0,0,0.1)" }}
                    >
                      <Clock color="#000" size={24} style={{ marginBottom: 8 }} />
                      <Text className="text-3xl font-bold text-black">
                        {Math.max(
                          0,
                          Math.ceil(
                            (new Date(streak.endDate).getTime() - new Date().getTime()) /
                              (1000 * 60 * 60 * 24)
                          )
                        )}
                      </Text>
                      <Text className="text-xs text-black/70 font-medium">Days Left</Text>
                    </View>
                  )}
                  <View
                    className="flex-1 rounded-2xl p-4 items-center"
                    style={{ backgroundColor: "rgba(0,0,0,0.1)" }}
                  >
                    <Target color="#000" size={24} style={{ marginBottom: 8 }} />
                    <Text className="text-3xl font-bold text-black">{streak.members.length}</Text>
                    <Text className="text-xs text-black/70 font-medium">Competitors</Text>
                  </View>
                </View>

                {streak.punishment === "custom" && streak.customPunishment && (
                  <View
                    style={{
                      backgroundColor: "rgba(0,0,0,0.1)",
                      borderRadius: 16,
                      padding: 12,
                      marginTop: 12,
                    }}
                  >
                    <Text className="text-xs text-black/70 font-semibold mb-1">Consequence:</Text>
                    <Text className="text-sm text-black font-medium">
                      {streak.customPunishment}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Calendar */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-gray-900">Your Consistency</Text>
              <Text className="text-sm text-gray-500">Last 7 weeks</Text>
            </View>
            <View className="bg-white rounded-3xl p-5">
              {/* Day labels */}
              <View className="flex-row mb-3">
                {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                  <View key={i} className="flex-1 items-center">
                    <Text className="text-xs text-gray-400 font-semibold">{day}</Text>
                  </View>
                ))}
              </View>
              {/* Calendar grid */}
              {calendarData.map((week, weekIndex) => (
                <View key={weekIndex} className="flex-row mb-2">
                  {week.map((day, dayIndex) => (
                    <View key={dayIndex} className="flex-1 items-center p-0.5">
                      <View
                        style={{
                          width: "100%",
                          aspectRatio: 1,
                          borderRadius: 8,
                          backgroundColor: day.hasCheckIn
                            ? "#00D9A5"
                            : day.isToday
                              ? "#E5E7EB"
                              : "#F3F4F6",
                          borderWidth: day.isToday && !day.hasCheckIn ? 2 : 0,
                          borderColor: "#6B7280",
                        }}
                      />
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </View>

          {/* Leaderboard */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center gap-2">
                <Award color="#000" size={24} />
                <Text className="text-xl font-bold text-gray-900">Leaderboard</Text>
              </View>
              <Text className="text-sm text-gray-500">30-day consistency</Text>
            </View>
            {sortedPartnerStats.map((stat, index) => {
              const isMe = stat.member.userId === session?.user.id;
              const isFirst = index === 0;

              return (
                <View
                  key={stat.member.id}
                  style={{
                    backgroundColor: isMe ? "#F0F9FF" : "#FFF",
                    borderRadius: 20,
                    padding: 16,
                    marginBottom: 12,
                    borderWidth: isMe ? 2 : 0,
                    borderColor: isMe ? "#3B82F6" : "transparent",
                  }}
                >
                  <View className="flex-row items-center mb-3">
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: isFirst ? "#FFD700" : "#E5E7EB",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 12,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "bold",
                          color: isFirst ? "#000" : "#6B7280",
                        }}
                      >
                        #{index + 1}
                      </Text>
                    </View>
                    <View
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 22,
                        backgroundColor: stat.checkedInToday ? "#00D9A5" : "#6C5CE7",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 12,
                      }}
                    >
                      <Text style={{ fontSize: 18, color: "#fff", fontWeight: "600" }}>
                        {stat.member.user.name?.charAt(0).toUpperCase() || "?"}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2">
                        <Text className="text-base font-bold text-gray-900">
                          {stat.member.user.name}
                        </Text>
                        {isMe && (
                          <View
                            style={{
                              backgroundColor: "#3B82F6",
                              paddingHorizontal: 8,
                              paddingVertical: 2,
                              borderRadius: 8,
                            }}
                          >
                            <Text className="text-white text-xs font-bold">You</Text>
                          </View>
                        )}
                      </View>
                      <View className="flex-row items-center gap-3 mt-1">
                        <View className="flex-row items-center gap-1">
                          <Flame color="#FF6B35" size={12} />
                          <Text className="text-xs text-gray-600 font-medium">
                            {stat.currentStreak} days
                          </Text>
                        </View>
                        <View className="flex-row items-center gap-1">
                          <CheckCircle2 color="#00D9A5" size={12} />
                          <Text className="text-xs text-gray-600 font-medium">
                            {stat.totalCheckIns} total
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View className="items-end">
                      <Text
                        className="text-2xl font-bold"
                        style={{
                          color:
                            stat.consistencyPercentage >= 70
                              ? "#00D9A5"
                              : stat.consistencyPercentage >= 40
                                ? "#FFA500"
                                : "#EF4444",
                        }}
                      >
                        {stat.consistencyPercentage}%
                      </Text>
                      {stat.checkedInToday && (
                        <View
                          style={{
                            backgroundColor: "#00D9A5",
                            paddingHorizontal: 6,
                            paddingVertical: 2,
                            borderRadius: 6,
                            marginTop: 4,
                          }}
                        >
                          <Text className="text-white text-xs font-bold">✓ Today</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Consistency Bar */}
                  <View
                    style={{
                      height: 8,
                      backgroundColor: "#E5E7EB",
                      borderRadius: 4,
                      overflow: "hidden",
                    }}
                  >
                    <View
                      style={{
                        width: `${stat.consistencyPercentage}%`,
                        height: "100%",
                        backgroundColor:
                          stat.consistencyPercentage >= 70
                            ? "#00D9A5"
                            : stat.consistencyPercentage >= 40
                              ? "#FFA500"
                              : "#EF4444",
                      }}
                    />
                  </View>
                </View>
              );
            })}
          </View>

          {/* Invite Code */}
          <View className="bg-gray-100 rounded-3xl p-5 mb-6">
            <Text className="text-sm font-bold text-gray-900 mb-3">Invite Code</Text>
            <View className="bg-white rounded-2xl p-4 mb-2">
              <Text className="text-center text-2xl font-mono font-bold text-gray-900 tracking-wider">
                {streak.inviteCode}
              </Text>
            </View>
            <Text className="text-xs text-gray-600 text-center">
              Share this code to invite partners
            </Text>
          </View>

          {/* Photo Gallery Button */}
          {streak.checkIns.some((c) => c.photoUrl) && (
            <Pressable
              onPress={() =>
                navigation.navigate("PhotoGalleryScreen", {
                  checkIns: streak.checkIns,
                  streakName: streak.name,
                })
              }
              className="active:opacity-80"
            >
              <View
                style={{
                  backgroundColor: "#FFF",
                  borderRadius: 20,
                  padding: 18,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.06,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <ImageIcon color="#FF6B35" size={22} style={{ marginRight: 12 }} />
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: "#1F2937",
                  }}
                >
                  View Photo Gallery
                </Text>
              </View>
            </Pressable>
          )}
        </View>
      </ScrollView>

      {/* Floating Check-in Button */}
      {!todayCheckedIn && (
        <View
          style={{
            position: "absolute",
            bottom: 20,
            left: 20,
            right: 20,
          }}
        >
          <Pressable onPress={handleCheckIn} className="active:scale-95">
            <View
              style={{
                backgroundColor: "#000",
                borderRadius: 20,
                padding: 20,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 12,
                elevation: 8,
              }}
            >
              <Camera color="#fff" size={24} style={{ marginRight: 12 }} />
              <Text className="text-white font-bold text-lg">Check In Today</Text>
            </View>
          </Pressable>
        </View>
      )}
    </View>
  );
};

export default StreakDetailScreen;
