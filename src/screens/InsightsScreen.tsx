import React, { useMemo } from "react";
import { View, Text, ScrollView, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  TrendingUp,
  TrendingDown,
  Flame,
  Calendar,
  Award,
  Target,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react-native";
import type { RootStackScreenProps } from "@/navigation/types";
import { useSession } from "@/lib/useSession";
import { useStreaksStore } from "@/state/streaksStore";

type Props = RootStackScreenProps<"InsightsScreen">;

const { width } = Dimensions.get("window");

const InsightsScreen = ({ navigation }: Props) => {
  const { data: session } = useSession();
  const streaks = useStreaksStore((s) => s.streaks);

  // Calculate insights
  const insights = useMemo(() => {
    if (!session) return null;

    const now = new Date();
    const last7Days = new Date(now);
    last7Days.setDate(now.getDate() - 7);
    const last14Days = new Date(now);
    last14Days.setDate(now.getDate() - 14);
    const last30Days = new Date(now);
    last30Days.setDate(now.getDate() - 30);
    const last60Days = new Date(now);
    last60Days.setDate(now.getDate() - 60);

    let totalCheckIns = 0;
    let checkInsLast7Days = 0;
    let checkInsLast14Days = 0;
    let checkInsLast30Days = 0;
    let checkInsLast60Days = 0;
    let longestStreak = 0;
    let currentActiveStreaks = 0;

    streaks.forEach((streak) => {
      const userCheckIns = streak.checkIns.filter((c) => c.userId === session.user.id);
      totalCheckIns += userCheckIns.length;

      // Count check-ins by time period
      userCheckIns.forEach((c) => {
        const checkInDate = new Date(c.date);
        if (checkInDate >= last7Days) checkInsLast7Days++;
        if (checkInDate >= last14Days) checkInsLast14Days++;
        if (checkInDate >= last30Days) checkInsLast30Days++;
        if (checkInDate >= last60Days) checkInsLast60Days++;
      });

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

      // Check if this streak is currently active
      const todayStr = new Date().toISOString().split("T")[0];
      const yesterdayStr = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
      const hasRecentCheckIn = userCheckIns.some(
        (c) => c.date === todayStr || c.date === yesterdayStr
      );
      if (hasRecentCheckIn) currentActiveStreaks++;
    });

    // Calculate trends (comparing last 7 days to previous 7 days)
    const checkInsPrevious7Days = checkInsLast14Days - checkInsLast7Days;
    const checkInsTrend =
      checkInsPrevious7Days > 0
        ? ((checkInsLast7Days - checkInsPrevious7Days) / checkInsPrevious7Days) * 100
        : checkInsLast7Days > 0
          ? 100
          : 0;

    // Calculate 30-day vs 60-day trend
    const checkInsPrevious30Days = checkInsLast60Days - checkInsLast30Days;
    const monthlyTrend =
      checkInsPrevious30Days > 0
        ? ((checkInsLast30Days - checkInsPrevious30Days) / checkInsPrevious30Days) * 100
        : checkInsLast30Days > 0
          ? 100
          : 0;

    return {
      totalCheckIns,
      checkInsLast7Days,
      checkInsLast30Days,
      longestStreak,
      currentActiveStreaks,
      totalStreaks: streaks.length,
      checkInsTrend,
      monthlyTrend,
      averagePerDay: checkInsLast30Days / 30,
    };
  }, [streaks, session]);

  if (!session || !insights) {
    return (
      <View style={{ flex: 1, backgroundColor: "#FAFAFA" }} className="items-center justify-center">
        <Text className="text-gray-500">No insights available</Text>
      </View>
    );
  }

  const getTrendIcon = (trend: number) => {
    if (trend > 5) return ArrowUp;
    if (trend < -5) return ArrowDown;
    return Minus;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 5) return "#00D9A5";
    if (trend < -5) return "#EF4444";
    return "#6B7280";
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FAFAFA" }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View
          style={{
            backgroundColor: "#FFF",
            padding: 20,
            paddingTop: 80,
            paddingBottom: 32,
          }}
        >
          <Text
            style={{
              fontSize: 32,
              fontWeight: "800",
              color: "#1F2937",
              marginBottom: 8,
              letterSpacing: -1,
            }}
          >
            Your Insights
          </Text>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "500",
              color: "#6B7280",
            }}
          >
            Track your progress and build momentum
          </Text>
        </View>

        <View style={{ padding: 20 }}>
          {/* Weekly Overview */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: "#1F2937",
                marginBottom: 16,
              }}
            >
              This Week
            </Text>

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
              }}
            >
              <View style={{ alignItems: "center", marginBottom: 20 }}>
                <Text
                  style={{
                    fontSize: 64,
                    fontWeight: "800",
                    color: "#1F2937",
                    lineHeight: 64,
                  }}
                >
                  {insights.checkInsLast7Days}
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: "#6B7280",
                    marginTop: 8,
                  }}
                >
                  Check-ins this week
                </Text>
              </View>

              {/* Trend Indicator */}
              {insights.checkInsTrend !== 0 && (
                <View
                  style={{
                    backgroundColor:
                      insights.checkInsTrend > 0 ? "#ECFDF5" : "#FEE2E2",
                    borderRadius: 12,
                    padding: 12,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  {React.createElement(getTrendIcon(insights.checkInsTrend), {
                    color: getTrendColor(insights.checkInsTrend),
                    size: 20,
                  })}
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "700",
                      color: getTrendColor(insights.checkInsTrend),
                    }}
                  >
                    {Math.abs(Math.round(insights.checkInsTrend))}%{" "}
                    {insights.checkInsTrend > 0 ? "increase" : "decrease"} from last
                    week
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Key Metrics Grid */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: "#1F2937",
                marginBottom: 16,
              }}
            >
              Key Metrics
            </Text>

            <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
              {/* Total Check-ins */}
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
                    backgroundColor: "#FFF3ED",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 12,
                  }}
                >
                  <Calendar color="#FF6B35" size={20} />
                </View>
                <Text
                  style={{
                    fontSize: 28,
                    fontWeight: "800",
                    color: "#1F2937",
                    marginBottom: 4,
                  }}
                >
                  {insights.totalCheckIns}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: "#6B7280",
                  }}
                >
                  Total Check-ins
                </Text>
              </View>

              {/* Longest Streak */}
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
                    backgroundColor: "#FEF3C7",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 12,
                  }}
                >
                  <Flame color="#F59E0B" size={20} fill="#F59E0B" />
                </View>
                <Text
                  style={{
                    fontSize: 28,
                    fontWeight: "800",
                    color: "#1F2937",
                    marginBottom: 4,
                  }}
                >
                  {insights.longestStreak}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: "#6B7280",
                  }}
                >
                  Best Streak
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: 12 }}>
              {/* Active Streaks */}
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
                    backgroundColor: "#ECFDF5",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 12,
                  }}
                >
                  <Target color="#00D9A5" size={20} />
                </View>
                <Text
                  style={{
                    fontSize: 28,
                    fontWeight: "800",
                    color: "#1F2937",
                    marginBottom: 4,
                  }}
                >
                  {insights.currentActiveStreaks}
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

              {/* Average per Day */}
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
                    backgroundColor: "#EDE9FE",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 12,
                  }}
                >
                  <TrendingUp color="#9333EA" size={20} />
                </View>
                <Text
                  style={{
                    fontSize: 28,
                    fontWeight: "800",
                    color: "#1F2937",
                    marginBottom: 4,
                  }}
                >
                  {insights.averagePerDay.toFixed(1)}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: "#6B7280",
                  }}
                >
                  Avg/Day (30d)
                </Text>
              </View>
            </View>
          </View>

          {/* Monthly Performance */}
          <View>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: "#1F2937",
                marginBottom: 16,
              }}
            >
              Monthly Performance
            </Text>

            <LinearGradient
              colors={["#FF6B35", "#F7931E"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: 24,
                padding: 24,
                shadowColor: "#FF6B35",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
                elevation: 8,
              }}
            >
              <View style={{ marginBottom: 20 }}>
                <Text
                  style={{
                    fontSize: 48,
                    fontWeight: "800",
                    color: "#FFF",
                    lineHeight: 48,
                  }}
                >
                  {insights.checkInsLast30Days}
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: "rgba(255,255,255,0.9)",
                    marginTop: 8,
                  }}
                >
                  Check-ins this month
                </Text>
              </View>

              {insights.monthlyTrend !== 0 && (
                <View
                  style={{
                    backgroundColor: "rgba(255,255,255,0.2)",
                    borderRadius: 12,
                    padding: 12,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  {React.createElement(getTrendIcon(insights.monthlyTrend), {
                    color: "#FFF",
                    size: 20,
                  })}
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "700",
                      color: "#FFF",
                    }}
                  >
                    {Math.abs(Math.round(insights.monthlyTrend))}%{" "}
                    {insights.monthlyTrend > 0 ? "better" : "lower"} than last month
                  </Text>
                </View>
              )}
            </LinearGradient>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default InsightsScreen;
