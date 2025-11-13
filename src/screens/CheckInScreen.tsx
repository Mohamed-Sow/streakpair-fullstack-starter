import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, Image, Alert, ActivityIndicator } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { LinearGradient } from "expo-linear-gradient";
import { Camera, Image as ImageIcon, CheckCircle2 } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import type { RootStackScreenProps } from "@/navigation/types";
import { api, BACKEND_URL } from "@/lib/api";
import type { CreateCheckInResponse, UploadImageResponse, GetStreakDetailsResponse } from "@/shared/contracts";
import CelebrationModal from "@/components/CelebrationModal";
import { useSession } from "@/lib/useSession";

type Props = RootStackScreenProps<"CheckInScreen">;

const CheckInScreen = ({ route, navigation }: Props) => {
  const { streakId } = route.params;
  const { data: session } = useSession();
  const [note, setNote] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState<{
    milestone: number;
    type: "streak" | "checkin";
  } | null>(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Please grant photo library access to select images");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Please grant camera access to take photos");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string): Promise<string | null> => {
    try {
      setIsUploading(true);

      // Create form data
      const formData = new FormData();
      const filename = uri.split("/").pop() || "photo.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      formData.append("image", {
        uri,
        name: filename,
        type,
      } as any);

      // Upload to backend
      const response = await fetch(`${BACKEND_URL}/api/upload/image`, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data: UploadImageResponse = await response.json();
      return data.url;
    } catch (error) {
      console.error("Failed to upload image:", error);
      Alert.alert("Error", "Failed to upload image. Please try again.");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleCheckIn = async () => {
    setIsLoading(true);
    try {
      let photoUrl: string | undefined = undefined;

      // Upload image if one was selected
      if (imageUri) {
        const uploadedUrl = await uploadImage(imageUri);
        if (!uploadedUrl) {
          setIsLoading(false);
          return;
        }
        photoUrl = uploadedUrl;
      }

      // Create check-in
      const today = new Date().toISOString().split("T")[0];
      const response = await api.post<CreateCheckInResponse>(
        `/api/streaks/${streakId}/check-in`,
        {
          date: today,
          photoUrl,
          note: note.trim() || undefined,
        }
      );

      if (response.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Fetch updated streak details to check for milestones
        const streakDetails = await api.get<GetStreakDetailsResponse>(`/api/streaks/${streakId}`);

        if (streakDetails.success && streakDetails.streak && session) {
          const userCheckIns = streakDetails.streak.checkIns.filter(c => c.userId === session.user.id);
          const totalCheckIns = userCheckIns.length;

          // Calculate current streak
          const dates = userCheckIns.map((c) => c.date).sort().reverse();
          let currentStreak = 0;

          if (dates.length > 0) {
            const todayStr = new Date().toISOString().split("T")[0];
            const mostRecentDate = dates[0];
            const daysSinceLastCheckIn = Math.floor(
              (new Date(todayStr).getTime() - new Date(mostRecentDate).getTime()) / (1000 * 60 * 60 * 24)
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

          // Check for streak milestones
          const streakMilestones = [7, 30, 100, 365];
          if (streakMilestones.includes(currentStreak)) {
            setCelebrationData({ milestone: currentStreak, type: "streak" });
            setShowCelebration(true);
            return; // Don't navigate yet, celebration will handle it
          }

          // Check for check-in milestones
          const checkInMilestones = [10, 50, 100];
          if (checkInMilestones.includes(totalCheckIns)) {
            setCelebrationData({ milestone: totalCheckIns, type: "checkin" });
            setShowCelebration(true);
            return; // Don't navigate yet, celebration will handle it
          }
        }

        // No milestone, just show success and navigate
        Alert.alert("Success!", "Check-in completed! Keep the streak alive! 🔥", [
          {
            text: "OK",
            onPress: () => {
              navigation.goBack();
            },
          },
        ]);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert("Error", response.message || "Failed to check in");
      }
    } catch (error) {
      console.error("Failed to check in:", error);
      Alert.alert("Error", "Failed to check in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FAFAFA" }}>
      {/* Celebration Modal */}
      {celebrationData && (
        <CelebrationModal
          visible={showCelebration}
          milestone={celebrationData.milestone}
          type={celebrationData.type}
          onClose={() => {
            setShowCelebration(false);
            navigation.goBack();
          }}
        />
      )}

      <KeyboardAwareScrollView style={{ flex: 1 }}>
        <View className="p-6">
          {/* Header */}
          <View className="items-center mb-6">
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: "#FFF3ED",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <CheckCircle2 color="#FF6B35" size={40} />
            </View>
            <Text className="text-2xl font-bold text-gray-900 mb-2">Daily Check-In</Text>
            <Text className="text-sm text-gray-600 text-center">
              Show proof and add notes to keep your streak alive
            </Text>
          </View>

          {/* Image Section */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-3">
              Photo Proof (Optional)
            </Text>
            {imageUri ? (
              <View className="relative">
                <Image
                  source={{ uri: imageUri }}
                  style={{
                    width: "100%",
                    height: 240,
                    borderRadius: 16,
                    backgroundColor: "#F3F4F6",
                  }}
                  resizeMode="cover"
                />
                <Pressable
                  onPress={() => setImageUri(null)}
                  className="absolute top-3 right-3"
                  style={{
                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 8,
                  }}
                >
                  <Text className="text-white text-xs font-semibold">Remove</Text>
                </Pressable>
              </View>
            ) : (
              <View className="flex-row gap-3">
                <Pressable
                  onPress={takePhoto}
                  className="flex-1 active:opacity-80"
                  disabled={isLoading || isUploading}
                >
                  <View className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-6 items-center">
                    <View
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                        backgroundColor: "#F3F4F6",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 8,
                      }}
                    >
                      <Camera color="#6B7280" size={24} />
                    </View>
                    <Text className="text-sm font-semibold text-gray-900">Take Photo</Text>
                  </View>
                </Pressable>

                <Pressable
                  onPress={pickImage}
                  className="flex-1 active:opacity-80"
                  disabled={isLoading || isUploading}
                >
                  <View className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-6 items-center">
                    <View
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                        backgroundColor: "#F3F4F6",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 8,
                      }}
                    >
                      <ImageIcon color="#6B7280" size={24} />
                    </View>
                    <Text className="text-sm font-semibold text-gray-900">Choose Photo</Text>
                  </View>
                </Pressable>
              </View>
            )}
          </View>

          {/* Note Input */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Notes (Optional)
            </Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="How did it go today? Any thoughts?"
              placeholderTextColor="#9CA3AF"
              className="bg-white border border-gray-200 rounded-2xl px-4 py-4 text-base"
              maxLength={500}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              editable={!isLoading && !isUploading}
            />
            <Text className="text-xs text-gray-500 mt-1 text-right">
              {note.length}/500
            </Text>
          </View>

          {/* Info Card */}
          <View className="bg-orange-50 rounded-2xl p-4 mb-6">
            <View className="flex-row items-start">
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: "#FFF3ED",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                  marginTop: 2,
                }}
              >
                <Text style={{ fontSize: 16 }}>💡</Text>
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-orange-900 mb-1">
                  Keep it authentic!
                </Text>
                <Text className="text-xs text-orange-700">
                  Share real moments to build trust and accountability with your partner
                </Text>
              </View>
            </View>
          </View>

          {/* Check-In Button */}
          <Pressable
            onPress={handleCheckIn}
            disabled={isLoading || isUploading}
            className="active:opacity-80"
          >
            <LinearGradient
              colors={["#FF6B35", "#F7931E"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: 16,
                padding: 18,
                alignItems: "center",
                opacity: isLoading || isUploading ? 0.6 : 1,
              }}
            >
              {isLoading || isUploading ? (
                <View className="flex-row items-center">
                  <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
                  <Text className="text-white font-bold text-lg">
                    {isUploading ? "Uploading..." : "Checking In..."}
                  </Text>
                </View>
              ) : (
                <Text className="text-white font-bold text-lg">Complete Check-In</Text>
              )}
            </LinearGradient>
          </Pressable>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default CheckInScreen;
