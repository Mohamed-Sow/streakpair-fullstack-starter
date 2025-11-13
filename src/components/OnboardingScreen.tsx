import React, { useState, useRef } from "react";
import { View, Text, Pressable, Dimensions, FlatList, ViewToken } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Users, Flame, Trophy, X } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

interface OnboardingSlide {
  id: string;
  icon: any;
  gradient: readonly [string, string];
  title: string;
  description: string;
}

const slides: OnboardingSlide[] = [
  {
    id: "1",
    icon: Users,
    gradient: ["#FF6B35", "#F7931E"] as const,
    title: "Build Habits Together",
    description: "Partner with friends or accountability buddies to stay motivated and build lasting habits.",
  },
  {
    id: "2",
    icon: Flame,
    gradient: ["#00D9A5", "#00B887"] as const,
    title: "Track Your Streaks",
    description: "Check in daily with photos and notes. Watch your consistency grow as you maintain your streaks.",
  },
  {
    id: "3",
    icon: Trophy,
    gradient: ["#FFD700", "#FFA500"] as const,
    title: "Compete & Win",
    description: "Turn habits into friendly competitions with stakes, prizes, and leaderboards to keep you accountable.",
  },
];

interface OnboardingScreenProps {
  onComplete: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      handleComplete();
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem("@onboarding_completed", "true");
    onComplete();
  };

  const handleComplete = async () => {
    await AsyncStorage.setItem("@onboarding_completed", "true");
    onComplete();
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderSlide = ({ item }: { item: OnboardingSlide }) => {
    const IconComponent = item.icon;

    return (
      <View
        style={{
          width,
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 40,
        }}
      >
        <LinearGradient
          colors={item.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 48,
            shadowColor: item.gradient[0],
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.4,
            shadowRadius: 24,
            elevation: 10,
          }}
        >
          <IconComponent color="#FFF" size={56} fill="#FFF" />
        </LinearGradient>

        <Text
          style={{
            fontSize: 32,
            fontWeight: "800",
            color: "#1F2937",
            marginBottom: 20,
            textAlign: "center",
            letterSpacing: -1,
          }}
        >
          {item.title}
        </Text>

        <Text
          style={{
            fontSize: 17,
            fontWeight: "500",
            color: "#6B7280",
            textAlign: "center",
            lineHeight: 26,
            paddingHorizontal: 20,
          }}
        >
          {item.description}
        </Text>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FAFAFA" }}>
      {/* Skip Button */}
      {currentIndex < slides.length - 1 && (
        <Pressable
          onPress={handleSkip}
          style={{
            position: "absolute",
            top: 60,
            right: 20,
            zIndex: 10,
            paddingHorizontal: 20,
            paddingVertical: 10,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: "#6B7280",
            }}
          >
            Skip
          </Text>
        </Pressable>
      )}

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />

      {/* Bottom Section */}
      <View style={{ padding: 40, paddingBottom: 60 }}>
        {/* Pagination Dots */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginBottom: 32,
            gap: 8,
          }}
        >
          {slides.map((_, index) => (
            <View
              key={index}
              style={{
                width: currentIndex === index ? 24 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: currentIndex === index ? "#FF6B35" : "#D1D5DB",
              }}
            />
          ))}
        </View>

        {/* Next/Get Started Button */}
        <Pressable onPress={handleNext} style={{ width: "100%" }}>
          <LinearGradient
            colors={slides[currentIndex].gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 20,
              padding: 18,
              alignItems: "center",
              shadowColor: slides[currentIndex].gradient[0],
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 6,
            }}
          >
            <Text
              style={{
                color: "#FFF",
                fontSize: 18,
                fontWeight: "700",
                letterSpacing: 0.3,
              }}
            >
              {currentIndex === slides.length - 1 ? "Get Started" : "Next"}
            </Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
};

export default OnboardingScreen;
