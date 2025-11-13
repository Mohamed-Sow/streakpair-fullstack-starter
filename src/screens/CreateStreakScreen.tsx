import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import * as Haptics from "expo-haptics";
import { Flame, Trophy, DollarSign, Calendar, Hash } from "lucide-react-native";
import type { RootStackScreenProps } from "@/navigation/types";
import { api } from "@/lib/api";
import type { CreateStreakResponse, JoinStreakResponse } from "@/shared/contracts";
import { useStreaksStore } from "@/state/streaksStore";

type Props = RootStackScreenProps<"CreateStreakScreen">;

const EMOJI_OPTIONS = ["🔥", "💪", "📚", "🏃", "💧", "🧘", "🎯", "✍️", "🌟", "⚡", "🏆", "💰"];

const CreateStreakScreen = ({ navigation }: Props) => {
  const [mode, setMode] = useState<"create" | "join">("create");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("🔥");
  const [inviteCode, setInviteCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Competition settings
  const [isCompetition, setIsCompetition] = useState(false);
  const [competitionType, setCompetitionType] = useState<"duo" | "team" | "ffa">("duo");
  const [endDate, setEndDate] = useState("");
  const [stakesPerPerson, setStakesPerPerson] = useState("");
  const [punishment, setPunishment] = useState<"monetary" | "none" | "custom">("none");
  const [customPunishment, setCustomPunishment] = useState("");

  const addStreak = useStreaksStore((s) => s.addStreak);

  const handleCreateStreak = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a streak name");
      return;
    }

    if (isCompetition) {
      // Validate end date
      if (!endDate) {
        Alert.alert("Error", "Please select an end date for the competition");
        return;
      }

      // Validate date format (YYYY-MM-DD)
      const datePattern = /^\d{4}-\d{2}-\d{2}$/;
      if (!datePattern.test(endDate)) {
        Alert.alert("Error", "Please enter date in YYYY-MM-DD format (e.g., 2025-12-31)");
        return;
      }

      // Validate date is valid
      const selectedDate = new Date(endDate);
      if (isNaN(selectedDate.getTime())) {
        Alert.alert("Error", "Please enter a valid date");
        return;
      }

      // Validate date is in the future (at least tomorrow)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      if (selectedDate < tomorrow) {
        Alert.alert("Error", "End date must be at least tomorrow or later");
        return;
      }

      // Validate date is not too far in the future (max 1 year)
      const oneYearFromNow = new Date(today);
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

      if (selectedDate > oneYearFromNow) {
        Alert.alert("Error", "End date cannot be more than 1 year from now");
        return;
      }

      if (punishment === "monetary" && (!stakesPerPerson || parseFloat(stakesPerPerson) <= 0)) {
        Alert.alert("Error", "Please enter a valid stake amount");
        return;
      }
      if (punishment === "custom" && !customPunishment.trim()) {
        Alert.alert("Error", "Please describe the custom punishment");
        return;
      }
    }

    setIsLoading(true);
    try {
      const response = await api.post<CreateStreakResponse>("/api/streaks", {
        name: name.trim(),
        description: description.trim() || undefined,
        emoji: selectedEmoji,
        frequency: "daily",
        isCompetition,
        competitionType: isCompetition ? competitionType : undefined,
        endDate: isCompetition ? new Date(endDate).toISOString() : undefined,
        stakesPerPerson:
          isCompetition && punishment === "monetary" ? parseFloat(stakesPerPerson) : 0,
        punishment: isCompetition ? punishment : undefined,
        customPunishment:
          isCompetition && punishment === "custom" ? customPunishment.trim() : undefined,
      });

      if (response.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        const competitionMessage = isCompetition
          ? `\n\nType: ${competitionType.toUpperCase()}\nEnds: ${new Date(endDate).toLocaleDateString()}\n${punishment === "monetary" ? `Stakes: $${stakesPerPerson}/person` : punishment === "custom" ? `Punishment: ${customPunishment}` : ""}`
          : "";

        Alert.alert(
          "Success!",
          `${isCompetition ? "Competition" : "Streak"} created!${competitionMessage}\n\nInvite Code: ${response.streak.inviteCode}\n\nShare this code with your partner${isCompetition ? "s" : ""} to join.`,
          [
            {
              text: "OK",
              onPress: () => {
                navigation.goBack();
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error("Failed to create streak:", error);
      Alert.alert("Error", "Failed to create streak. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinStreak = async () => {
    if (!inviteCode.trim()) {
      Alert.alert("Error", "Please enter an invite code");
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post<JoinStreakResponse>("/api/streaks/join", {
        inviteCode: inviteCode.trim(),
      });

      if (response.success && response.streak) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert("Success!", `You've joined "${response.streak.name}"!`, [
          {
            text: "OK",
            onPress: () => {
              navigation.goBack();
            },
          },
        ]);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert("Error", response.message || "Failed to join streak");
      }
    } catch (error) {
      console.error("Failed to join streak:", error);
      Alert.alert("Error", "Failed to join streak. Please check the code and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FAFAFA" }}>
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="p-5">
          {/* Mode Toggle */}
          <View className="flex-row mb-6 bg-white rounded-full p-1">
            <Pressable
              onPress={() => setMode("create")}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 20,
                backgroundColor: mode === "create" ? "#000" : "transparent",
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  fontWeight: "600",
                  color: mode === "create" ? "#fff" : "#6B7280",
                }}
              >
                Create
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setMode("join")}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 20,
                backgroundColor: mode === "join" ? "#000" : "transparent",
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  fontWeight: "600",
                  color: mode === "join" ? "#fff" : "#6B7280",
                }}
              >
                Join
              </Text>
            </Pressable>
          </View>

          {mode === "create" ? (
            <>
              {/* Create Streak Form */}
              <Text className="text-2xl font-bold text-gray-900 mb-6">Create a Streak</Text>

              {/* Streak Name */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2">Streak Name *</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Morning Workout"
                  placeholderTextColor="#9CA3AF"
                  style={{
                    backgroundColor: "#FFF",
                    borderRadius: 16,
                    padding: 16,
                    fontSize: 16,
                    color: "#000",
                  }}
                  maxLength={50}
                />
              </View>

              {/* Description */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2">Description</Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="What's this streak about?"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={3}
                  style={{
                    backgroundColor: "#FFF",
                    borderRadius: 16,
                    padding: 16,
                    fontSize: 16,
                    color: "#000",
                    height: 80,
                    textAlignVertical: "top",
                  }}
                  maxLength={200}
                />
              </View>

              {/* Emoji Picker */}
              <View className="mb-6">
                <Text className="text-sm font-semibold text-gray-700 mb-2">Choose an Icon</Text>
                <View className="flex-row flex-wrap gap-2">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <Pressable
                      key={emoji}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setSelectedEmoji(emoji);
                      }}
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 26,
                        backgroundColor: selectedEmoji === emoji ? "#000" : "#FFF",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      className="active:scale-95"
                    >
                      <Text style={{ fontSize: 26 }}>{emoji}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Competition Mode Toggle */}
              <View
                style={{
                  backgroundColor: "#FFF",
                  borderRadius: 20,
                  padding: 20,
                  marginBottom: 20,
                }}
              >
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center gap-3 flex-1 mr-3">
                    <View
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 22,
                        backgroundColor: isCompetition ? "#FFF3ED" : "#F3F4F6",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Trophy color={isCompetition ? "#FF6B35" : "#6B7280"} size={22} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-bold text-gray-900">Competition Mode</Text>
                      <Text className="text-sm text-gray-500">Add stakes and rewards</Text>
                    </View>
                  </View>
                  <Switch
                    value={isCompetition}
                    onValueChange={(value) => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      setIsCompetition(value);
                    }}
                    trackColor={{ false: "#D1D5DB", true: "#FF6B35" }}
                    thumbColor={isCompetition ? "#FFFFFF" : "#F3F4F6"}
                    ios_backgroundColor="#D1D5DB"
                  />
                </View>

                {isCompetition && (
                  <>
                    {/* Competition Type */}
                    <View className="mt-4 mb-4">
                      <Text className="text-sm font-semibold text-gray-700 mb-2">Type</Text>
                      <View className="flex-row gap-2">
                        {(["duo", "team", "ffa"] as const).map((type) => (
                          <Pressable
                            key={type}
                            onPress={() => setCompetitionType(type)}
                            style={{
                              flex: 1,
                              paddingVertical: 12,
                              borderRadius: 12,
                              backgroundColor:
                                competitionType === type ? "#000" : "#F3F4F6",
                            }}
                          >
                            <Text
                              style={{
                                textAlign: "center",
                                fontWeight: "600",
                                fontSize: 13,
                                color: competitionType === type ? "#fff" : "#6B7280",
                              }}
                            >
                              {type === "duo"
                                ? "1v1"
                                : type === "team"
                                  ? "Team"
                                  : "Free-for-All"}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    </View>

                    {/* End Date */}
                    <View className="mb-4">
                      <Text className="text-sm font-semibold text-gray-700 mb-2">
                        End Date * (YYYY-MM-DD)
                      </Text>
                      <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3">
                        <Calendar color="#6B7280" size={20} style={{ marginRight: 8 }} />
                        <TextInput
                          value={endDate}
                          onChangeText={setEndDate}
                          placeholder="2025-12-31"
                          placeholderTextColor="#9CA3AF"
                          style={{ flex: 1, fontSize: 16, color: "#000" }}
                        />
                      </View>
                    </View>

                    {/* Punishment Type */}
                    <View className="mb-4">
                      <Text className="text-sm font-semibold text-gray-700 mb-2">
                        Consequence
                      </Text>
                      <View className="flex-row gap-2">
                        {(["none", "monetary", "custom"] as const).map((type) => (
                          <Pressable
                            key={type}
                            onPress={() => setPunishment(type)}
                            style={{
                              flex: 1,
                              paddingVertical: 12,
                              borderRadius: 12,
                              backgroundColor: punishment === type ? "#000" : "#F3F4F6",
                            }}
                          >
                            <Text
                              style={{
                                textAlign: "center",
                                fontWeight: "600",
                                fontSize: 13,
                                color: punishment === type ? "#fff" : "#6B7280",
                              }}
                            >
                              {type === "none"
                                ? "None"
                                : type === "monetary"
                                  ? "Money"
                                  : "Custom"}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    </View>

                    {/* Stakes Amount */}
                    {punishment === "monetary" && (
                      <View className="mb-4">
                        <Text className="text-sm font-semibold text-gray-700 mb-2">
                          Stakes Per Person *
                        </Text>
                        <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3">
                          <DollarSign color="#6B7280" size={20} style={{ marginRight: 8 }} />
                          <TextInput
                            value={stakesPerPerson}
                            onChangeText={setStakesPerPerson}
                            placeholder="50"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="decimal-pad"
                            style={{ flex: 1, fontSize: 16, color: "#000" }}
                          />
                        </View>
                        <Text className="text-xs text-gray-500 mt-2">
                          Winner takes all. Loser pays the stakes.
                        </Text>
                      </View>
                    )}

                    {/* Custom Punishment */}
                    {punishment === "custom" && (
                      <View className="mb-4">
                        <Text className="text-sm font-semibold text-gray-700 mb-2">
                          Custom Punishment *
                        </Text>
                        <TextInput
                          value={customPunishment}
                          onChangeText={setCustomPunishment}
                          placeholder="Buy dinner for the winner"
                          placeholderTextColor="#9CA3AF"
                          multiline
                          numberOfLines={2}
                          style={{
                            backgroundColor: "#F3F4F6",
                            borderRadius: 12,
                            padding: 12,
                            fontSize: 14,
                            color: "#000",
                            height: 60,
                            textAlignVertical: "top",
                          }}
                          maxLength={200}
                        />
                      </View>
                    )}
                  </>
                )}
              </View>

              {/* Create Button */}
              <Pressable
                onPress={handleCreateStreak}
                disabled={isLoading}
                className="active:opacity-80"
                style={{
                  backgroundColor: "#000",
                  borderRadius: 16,
                  padding: 18,
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-bold text-base">
                    Create {isCompetition ? "Competition" : "Streak"}
                  </Text>
                )}
              </Pressable>
            </>
          ) : (
            <>
              {/* Join Streak Form */}
              <Text className="text-2xl font-bold text-gray-900 mb-6">Join a Streak</Text>
              <Text className="text-base text-gray-600 mb-6">
                Enter the invite code shared by your partner to join their streak.
              </Text>

              <View className="mb-6">
                <Text className="text-sm font-semibold text-gray-700 mb-2">Invite Code *</Text>
                <View className="flex-row items-center bg-white rounded-xl px-4 py-3">
                  <Hash color="#6B7280" size={20} style={{ marginRight: 8 }} />
                  <TextInput
                    value={inviteCode}
                    onChangeText={setInviteCode}
                    placeholder="Enter code here"
                    placeholderTextColor="#9CA3AF"
                    autoCapitalize="none"
                    style={{ flex: 1, fontSize: 16, color: "#000" }}
                  />
                </View>
              </View>

              <Pressable
                onPress={handleJoinStreak}
                disabled={isLoading}
                className="active:opacity-80"
                style={{
                  backgroundColor: "#000",
                  borderRadius: 16,
                  padding: 18,
                  alignItems: "center",
                }}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-bold text-base">Join Streak</Text>
                )}
              </Pressable>
            </>
          )}
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default CreateStreakScreen;
