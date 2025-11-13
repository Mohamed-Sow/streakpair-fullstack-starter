import React, { useEffect, useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  ImageBackground,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Flame, Plus, Users, TrendingUp, Trophy, DollarSign, Clock, AlertCircle } from "lucide-react-native";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { BottomTabScreenProps } from "@/navigation/types";
import { useSession } from "@/lib/useSession";
import { useStreaksStore } from "@/state/streaksStore";
import { api } from "@/lib/api";
import type { GetStreaksResponse } from "@/shared/contracts";
import { StreakCardSkeleton } from "@/components/SkeletonLoader";
import OnboardingScreen from "@/components/OnboardingScreen";

type Props = BottomTabScreenProps<"HomeTab">;

const HomeScreen = ({ navigation }: Props) => {
  const { data: session, isPending } = useSession();
  const streaks = useStreaksStore((s) => s.streaks);
  const isLoading = useStreaksStore((s) => s.isLoading);
  const error = useStreaksStore((s) => s.error);
  const setStreaks = useStreaksStore((s) => s.setStreaks);
  const setLoading = useStreaksStore((s) => s.setLoading);
  const setError = useStreaksStore((s) => s.setError);
  const [refreshing, setRefreshing] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  // Check if onboarding has been completed
  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const completed = await AsyncStorage.getItem("@onboarding_completed");
        setShowOnboarding(!completed && !!session);
      } catch (error) {
        console.error("Failed to check onboarding status:", error);
      } finally {
        setCheckingOnboarding(false);
      }
    };

    if (session) {
      checkOnboarding();
    } else {
      setCheckingOnboarding(false);
    }
  }, [session]);

  const fetchStreaks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null); // Clear previous errors
      const response = await api.get<GetStreaksResponse>("/api/streaks");
      setStreaks(response.streaks);
    } catch (error: any) {
      const errorMessage = error?.message || "Unknown error";
      // Check if it's an auth error
      if (errorMessage.includes("401") || errorMessage.includes("Unauthorized")) {
        console.log("Session expired, user needs to re-authenticate");
        setError("Session expired. Please log in again.");
      } else {
        console.error("Failed to fetch streaks:", error);
        setError("Failed to load streaks");
      }
    } finally {
      setLoading(false);
    }
  }, [setLoading, setStreaks, setError]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      setError(null);
      const response = await api.get<GetStreaksResponse>("/api/streaks");
      setStreaks(response.streaks);
    } catch (error: any) {
      console.error("Failed to refresh streaks:", error);
    } finally {
      setRefreshing(false);
    }
  }, [setStreaks, setError]);

  useEffect(() => {
    if (session) {
      fetchStreaks();
    }
  }, [session, fetchStreaks]);

  // Refresh streaks when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (session) {
        fetchStreaks();
      }
    }, [session, fetchStreaks])
  );

  const getStreakCount = (streakId: string) => {
    const streak = streaks.find((s) => s.id === streakId);
    if (!streak) return 0;

    // Get unique dates for current user
    const userCheckIns = streak.checkIns.filter((c) => c.userId === session?.user.id);
    const uniqueDates = new Set(userCheckIns.map((c) => c.date));
    return uniqueDates.size;
  };

  // Memoize all streak calculations to prevent expensive recalculations
  const streakData = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const todayDate = new Date();
    const thirtyDaysAgo = new Date(todayDate);
    thirtyDaysAgo.setDate(todayDate.getDate() - 30);

    return streaks.map((streak) => {
      // Today's status
      const checkedInToday = streak.checkIns.some(
        (c) => c.userId === session?.user.id && c.date === today
      );

      // Streak count
      const userCheckIns = streak.checkIns.filter((c) => c.userId === session?.user.id);
      const uniqueDates = new Set(userCheckIns.map((c) => c.date));
      const streakCount = uniqueDates.size;

      // Last 7 days data
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(todayDate);
        date.setDate(todayDate.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];
        const hasCheckIn = streak.checkIns.some(
          (c) => c.userId === session?.user.id && c.date === dateStr
        );
        last7Days.push({ date: dateStr, hasCheckIn, isToday: i === 0 });
      }

      // 30-day consistency
      const recentCheckIns = userCheckIns.filter((c) => {
        const checkInDate = new Date(c.date);
        return checkInDate >= thirtyDaysAgo && checkInDate <= todayDate;
      });
      const recentUniqueDates = new Set(recentCheckIns.map((c) => c.date));
      const consistencyPercentage = Math.round((recentUniqueDates.size / 30) * 100);

      return {
        streakId: streak.id,
        streakCount,
        checkedInToday,
        last7Days,
        consistencyPercentage,
        partnerCount: streak.members.length,
      };
    });
  }, [streaks, session]);

  if (isPending || checkingOnboarding) {
    return (
      <View style={{ flex: 1, backgroundColor: "#FAFAFA" }} className="items-center justify-center">
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  // Show onboarding for new users
  if (showOnboarding && session) {
    return <OnboardingScreen onComplete={() => setShowOnboarding(false)} />;
  }

  if (!session) {
    return (
      <ImageBackground
        source={require("../../assets/background-1763006249568.png")}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(255, 255, 255, 0.75)",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <LinearGradient
            colors={["#FF6B35", "#F7931E"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: 140,
              height: 140,
              borderRadius: 70,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 32,
              shadowColor: "#FF6B35",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.4,
              shadowRadius: 16,
            }}
          >
            <Flame color="#fff" size={70} fill="#fff" />
          </LinearGradient>
          <Text
            style={{
              fontSize: 36,
              fontWeight: "800",
              color: "#1F2937",
              marginBottom: 12,
              textAlign: "center",
              letterSpacing: -0.5,
            }}
          >
            Welcome to WitnessMe
          </Text>
          <Text
            style={{
              fontSize: 17,
              fontWeight: "500",
              color: "#6B7280",
              textAlign: "center",
              marginBottom: 40,
              lineHeight: 24,
              paddingHorizontal: 20,
            }}
          >
            Track habits with a partner and stay accountable together
          </Text>
          <Pressable
            onPress={() => navigation.navigate("AuthScreen")}
            className="active:scale-95"
            style={{
              backgroundColor: "#000",
              paddingHorizontal: 40,
              paddingVertical: 18,
              borderRadius: 30,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <Text
              style={{
                color: "#FFF",
                fontWeight: "700",
                fontSize: 18,
                letterSpacing: 0.3,
              }}
            >
              Get Started
            </Text>
          </Pressable>
        </View>
      </ImageBackground>
    );
  }

  if (isLoading && streaks.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: "#FAFAFA" }}>
        <View style={{ padding: 20, paddingTop: 80 }}>
          {/* Skeleton for header */}
          <View style={{ marginBottom: 24 }}>
            <View style={{ width: 200, height: 32, backgroundColor: "#E5E7EB", borderRadius: 8, marginBottom: 8 }} />
            <View style={{ width: 150, height: 20, backgroundColor: "#E5E7EB", borderRadius: 8 }} />
          </View>

          {/* Skeleton for quick stats */}
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
            <View style={{ flex: 1, backgroundColor: "#FFF", borderRadius: 20, padding: 16, height: 100 }}>
              <View style={{ width: 40, height: 40, backgroundColor: "#E5E7EB", borderRadius: 20, marginBottom: 8 }} />
              <View style={{ width: 60, height: 24, backgroundColor: "#E5E7EB", borderRadius: 8, marginBottom: 4 }} />
              <View style={{ width: 80, height: 14, backgroundColor: "#E5E7EB", borderRadius: 8 }} />
            </View>
            <View style={{ flex: 1, backgroundColor: "#FFF", borderRadius: 20, padding: 16, height: 100 }}>
              <View style={{ width: 40, height: 40, backgroundColor: "#E5E7EB", borderRadius: 20, marginBottom: 8 }} />
              <View style={{ width: 60, height: 24, backgroundColor: "#E5E7EB", borderRadius: 8, marginBottom: 4 }} />
              <View style={{ width: 80, height: 14, backgroundColor: "#E5E7EB", borderRadius: 8 }} />
            </View>
          </View>

          {/* Skeleton cards */}
          <StreakCardSkeleton />
          <StreakCardSkeleton />
          <StreakCardSkeleton />
        </View>
      </View>
    );
  }

  // Show error state
  if (error && streaks.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: "#FAFAFA" }} className="items-center justify-center p-6">
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: "#FEE",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
          }}
        >
          <AlertCircle color="#EF4444" size={40} />
        </View>
        <Text className="text-2xl font-bold text-gray-900 mb-2">Oops!</Text>
        <Text className="text-base text-gray-600 text-center mb-8">{error}</Text>
        <Pressable
          onPress={() => {
            if (error.includes("Session expired") || error.includes("log in")) {
              navigation.navigate("AuthScreen");
            } else {
              fetchStreaks();
            }
          }}
          className="bg-[#FF6B35] px-8 py-4 rounded-full active:opacity-80"
        >
          <Text className="text-white font-semibold text-lg">
            {error.includes("Session expired") || error.includes("log in") ? "Log In" : "Try Again"}
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#FAFAFA" }}>
      <FlatList
        data={streaks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FF6B35"
            colors={["#FF6B35"]}
          />
        }
        ListHeaderComponent={
          <View className="mb-6">
            {/* Personalized Greeting */}
            <View className="mb-6">
              <Text
                style={{
                  fontSize: 32,
                  fontWeight: "800",
                  color: "#1F2937",
                  letterSpacing: -0.5,
                  marginBottom: 4,
                }}
              >
                {(() => {
                  const hour = new Date().getHours();
                  if (hour < 12) return "Good morning";
                  if (hour < 18) return "Good afternoon";
                  return "Good evening";
                })()}
                {session?.user?.name ? `, ${session.user.name.split(" ")[0]}` : ""}
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "500",
                  color: "#6B7280",
                }}
              >
                {streaks.length === 0
                  ? "Ready to start your first streak?"
                  : streakData.filter((d) => d.checkedInToday).length === streaks.length
                    ? "🎉 All streaks completed today!"
                    : streakData.filter((d) => d.checkedInToday).length > 0
                      ? `${streakData.filter((d) => d.checkedInToday).length} of ${streaks.length} completed today`
                      : "Time to check in and keep your streaks alive"}
              </Text>
            </View>

            {/* Quick Stats */}
            {streaks.length > 0 && (
              <View
                style={{
                  flexDirection: "row",
                  gap: 12,
                  marginBottom: 20,
                }}
              >
                {/* Total Streaks */}
                <View
                  style={{
                    flex: 1,
                    backgroundColor: "#FFF",
                    borderRadius: 20,
                    padding: 16,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.06,
                    shadowRadius: 8,
                    elevation: 2,
                  }}
                >
                  <LinearGradient
                    colors={["#FF6B35", "#F7931E"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 8,
                    }}
                  >
                    <Flame color="#FFF" size={20} fill="#FFF" />
                  </LinearGradient>
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: "800",
                      color: "#1F2937",
                      marginBottom: 2,
                    }}
                  >
                    {streaks.length}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color: "#6B7280",
                    }}
                  >
                    Active Streaks
                  </Text>
                </View>

                {/* Today's Progress */}
                <View
                  style={{
                    flex: 1,
                    backgroundColor: "#FFF",
                    borderRadius: 20,
                    padding: 16,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.06,
                    shadowRadius: 8,
                    elevation: 2,
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor:
                        streakData.filter((d) => d.checkedInToday).length === streaks.length
                          ? "#ECFDF5"
                          : "#FEF3C7",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 8,
                    }}
                  >
                    <TrendingUp
                      color={
                        streakData.filter((d) => d.checkedInToday).length === streaks.length
                          ? "#00D9A5"
                          : "#F59E0B"
                      }
                      size={20}
                    />
                  </View>
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: "800",
                      color: "#1F2937",
                      marginBottom: 2,
                    }}
                  >
                    {streakData.filter((d) => d.checkedInToday).length}/{streaks.length}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color: "#6B7280",
                    }}
                  >
                    Done Today
                  </Text>
                </View>
              </View>
            )}

            {/* Show error banner if there's an error but streaks are loaded */}
            {error && streaks.length > 0 && (
              <View
                style={{
                  backgroundColor: "#FEE2E2",
                  borderRadius: 12,
                  padding: 12,
                  marginTop: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <AlertCircle color="#EF4444" size={20} />
                <Text className="text-sm text-red-600 flex-1">{error}</Text>
                <Pressable onPress={() => setError(null)}>
                  <Text className="text-red-600 font-semibold text-sm">Dismiss</Text>
                </Pressable>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-16">
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: "#FFF",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 12,
                elevation: 3,
              }}
            >
              <Flame color="#FF6B35" size={40} />
            </View>
            <Text className="text-2xl font-bold text-gray-900 mb-2">No streaks yet</Text>
            <Text className="text-base text-gray-500 text-center mb-8 px-8">
              Start your first streak and build consistency
            </Text>
            <Pressable
              onPress={() => navigation.navigate("CreateStreakScreen")}
              className="bg-gray-900 px-8 py-4 rounded-2xl active:opacity-80"
            >
              <Text className="text-white font-semibold text-base">Create Streak</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => {
          const data = streakData.find((d) => d.streakId === item.id);
          if (!data) return null;

          const { streakCount, checkedInToday, last7Days, consistencyPercentage, partnerCount } =
            data;

          return (
            <Pressable
              onPress={() => navigation.navigate("StreakDetailScreen", { streakId: item.id })}
              className="mb-4 active:scale-98"
              style={{
                transform: [{ scale: 1 }],
              }}
            >
              {/* Simplified Card Design */}
              <View
                style={{
                  backgroundColor: "#FFF",
                  borderRadius: 24,
                  padding: 20,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.06,
                  shadowRadius: 12,
                  elevation: 3,
                  borderLeftWidth: 4,
                  borderLeftColor: item.isCompetition
                    ? "#FFD700"
                    : checkedInToday
                      ? "#00D9A5"
                      : "#FF6B35",
                }}
              >
                {/* Header Row */}
                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-row items-center flex-1">
                    {/* Simplified Emoji Badge */}
                    {item.emoji && (
                      <View
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 24,
                          backgroundColor: item.isCompetition
                            ? "#FFF9E6"
                            : checkedInToday
                              ? "#ECFDF5"
                              : "#FFF3ED",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 12,
                        }}
                      >
                        <Text style={{ fontSize: 24 }}>{item.emoji}</Text>
                      </View>
                    )}
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2">
                        <Text
                          style={{
                            fontSize: 18,
                            fontWeight: "700",
                            color: "#1F2937",
                            letterSpacing: -0.3,
                          }}
                          numberOfLines={1}
                        >
                          {item.name}
                        </Text>
                        {item.isCompetition && (
                          <Trophy color="#F59E0B" size={16} fill="#F59E0B" />
                        )}
                      </View>
                      {item.description && (
                        <Text
                          className="text-gray-500 text-sm mt-0.5"
                          numberOfLines={1}
                          style={{ fontWeight: "500" }}
                        >
                          {item.description}
                        </Text>
                      )}
                    </View>
                  </View>

                  {/* Streak Count Badge */}
                  <View
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 12,
                      backgroundColor: checkedInToday ? "#00D9A5" : "#F3F4F6",
                    }}
                  >
                    <View className="flex-row items-center gap-1">
                      <Flame
                        color={checkedInToday ? "#FFF" : "#FF6B35"}
                        size={14}
                        fill={checkedInToday ? "#FFF" : "#FF6B35"}
                      />
                      <Text
                        style={{
                          fontWeight: "800",
                          fontSize: 14,
                          color: checkedInToday ? "#FFF" : "#1F2937",
                        }}
                      >
                        {streakCount}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Competition Info - Compact */}
                {item.isCompetition && item.endDate && (
                  <View className="flex-row gap-2 mb-4">
                    {item.punishment === "monetary" && item.rewardPool > 0 && (
                      <View
                        style={{
                          flex: 1,
                          backgroundColor: "#F0FDF4",
                          borderRadius: 12,
                          padding: 10,
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <DollarSign color="#00D9A5" size={16} />
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: "700",
                            color: "#047857",
                          }}
                        >
                          ${item.rewardPool.toFixed(0)}
                        </Text>
                      </View>
                    )}
                    <View
                      style={{
                        flex: 1,
                        backgroundColor: "#FFFBEB",
                        borderRadius: 12,
                        padding: 10,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Clock color="#F59E0B" size={16} />
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "700",
                          color: "#B45309",
                        }}
                      >
                        {Math.max(
                          0,
                          Math.ceil(
                            (new Date(item.endDate).getTime() - new Date().getTime()) /
                              (1000 * 60 * 60 * 24)
                          )
                        )}d
                      </Text>
                    </View>
                  </View>
                )}

                {/* 7-Day Mini Chart */}
                <View>
                  <View className="flex-row items-center justify-between mb-2">
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: "600",
                        color: "#9CA3AF",
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      Last 7 Days
                    </Text>
                    <Text
                      style={{
                        fontWeight: "700",
                        fontSize: 12,
                        color:
                          consistencyPercentage >= 70
                            ? "#00D9A5"
                            : consistencyPercentage >= 40
                              ? "#F59E0B"
                              : "#EF4444",
                      }}
                    >
                      {consistencyPercentage}%
                    </Text>
                  </View>
                  <View className="flex-row items-end justify-between gap-1.5">
                    {last7Days.map(
                      (
                        day: { date: string; hasCheckIn: boolean; isToday: boolean },
                        index: number
                      ) => (
                        <View key={index} className="flex-1 items-center gap-1.5">
                          <View
                            style={{
                              width: "100%",
                              height: day.hasCheckIn ? 40 : 8,
                              backgroundColor: day.hasCheckIn ? "#00D9A5" : "#E5E7EB",
                              borderRadius: 6,
                              opacity: day.isToday && day.hasCheckIn ? 1 : day.hasCheckIn ? 0.8 : 0.5,
                            }}
                          />
                          <Text
                            style={{
                              fontSize: 10,
                              fontWeight: day.isToday ? "700" : "500",
                              color: day.isToday ? "#1F2937" : "#9CA3AF",
                            }}
                          >
                            {["S", "M", "T", "W", "T", "F", "S"][new Date(day.date).getDay()]}
                          </Text>
                        </View>
                      )
                    )}
                  </View>
                </View>
              </View>
            </Pressable>
          );
        }}
      />

      {/* Floating Action Button */}
      <View
        style={{
          position: "absolute",
          bottom: 100,
          right: 20,
        }}
      >
        <Pressable
          onPress={() => navigation.navigate("CreateStreakScreen")}
          className="active:scale-95"
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: "#000",
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          <Plus color="#fff" size={28} strokeWidth={2.5} />
        </Pressable>
      </View>
    </View>
  );
};

export default HomeScreen;
