import React, { useEffect, useRef } from "react";
import { View, Text, Modal, Pressable, Animated, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import ConfettiCannon from "react-native-confetti-cannon";
import { Trophy, Flame, Award, Target } from "lucide-react-native";

const { width, height } = Dimensions.get("window");

interface CelebrationModalProps {
  visible: boolean;
  milestone: number;
  type: "streak" | "checkin" | "consistency";
  onClose: () => void;
}

const CelebrationModal: React.FC<CelebrationModalProps> = ({
  visible,
  milestone,
  type,
  onClose,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const confettiRef = useRef<any>(null);

  useEffect(() => {
    if (visible) {
      // Trigger confetti
      confettiRef.current?.start();

      // Animate modal entrance
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible]);

  const getMilestoneConfig = () => {
    if (type === "streak") {
      if (milestone === 7) {
        return {
          title: "7 Day Streak!",
          message: "One week of consistency. You're building momentum!",
          icon: Flame,
          color: "#FF6B35",
          gradient: ["#FF6B35", "#F7931E"] as const,
        };
      } else if (milestone === 30) {
        return {
          title: "30 Day Streak!",
          message: "A full month! This habit is becoming part of who you are.",
          icon: Trophy,
          color: "#FFD700",
          gradient: ["#FFD700", "#FFA500"] as const,
        };
      } else if (milestone === 100) {
        return {
          title: "100 Day Streak!",
          message: "Century club! You're a consistency master.",
          icon: Award,
          color: "#9333EA",
          gradient: ["#9333EA", "#C026D3"] as const,
        };
      } else if (milestone === 365) {
        return {
          title: "365 Day Streak!",
          message: "A full year! This is legendary status.",
          icon: Award,
          color: "#DC2626",
          gradient: ["#DC2626", "#F97316"] as const,
        };
      }
    } else if (type === "checkin") {
      if (milestone === 10) {
        return {
          title: "10 Check-ins!",
          message: "Great start! You're building consistency.",
          icon: Target,
          color: "#00D9A5",
          gradient: ["#00D9A5", "#00B887"] as const,
        };
      } else if (milestone === 50) {
        return {
          title: "50 Check-ins!",
          message: "Half century! You're proving your commitment.",
          icon: Trophy,
          color: "#3B82F6",
          gradient: ["#3B82F6", "#2563EB"] as const,
        };
      } else if (milestone === 100) {
        return {
          title: "100 Check-ins!",
          message: "Century club! You're unstoppable.",
          icon: Award,
          color: "#9333EA",
          gradient: ["#9333EA", "#C026D3"] as const,
        };
      }
    }

    return {
      title: `${milestone} Days!`,
      message: "Keep it up!",
      icon: Flame,
      color: "#FF6B35",
      gradient: ["#FF6B35", "#F7931E"] as const,
    };
  };

  const config = getMilestoneConfig();
  const IconComponent = config.icon;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Confetti */}
        <ConfettiCannon
          ref={confettiRef}
          count={150}
          origin={{ x: width / 2, y: height / 2 }}
          autoStart={false}
          fadeOut
          explosionSpeed={350}
        />

        {/* Modal Content */}
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
            width: width - 80,
            maxWidth: 400,
          }}
        >
          <LinearGradient
            colors={config.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 32,
              padding: 40,
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 20 },
              shadowOpacity: 0.3,
              shadowRadius: 30,
              elevation: 10,
            }}
          >
            {/* Icon */}
            <View
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: "rgba(255, 255, 255, 0.25)",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 24,
              }}
            >
              <IconComponent color="#FFF" size={50} fill="#FFF" />
            </View>

            {/* Title */}
            <Text
              style={{
                fontSize: 36,
                fontWeight: "800",
                color: "#FFF",
                marginBottom: 12,
                textAlign: "center",
                letterSpacing: -1,
              }}
            >
              {config.title}
            </Text>

            {/* Message */}
            <Text
              style={{
                fontSize: 17,
                fontWeight: "500",
                color: "rgba(255, 255, 255, 0.95)",
                textAlign: "center",
                marginBottom: 32,
                lineHeight: 24,
              }}
            >
              {config.message}
            </Text>

            {/* Close Button */}
            <Pressable
              onPress={onClose}
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.25)",
                paddingHorizontal: 32,
                paddingVertical: 14,
                borderRadius: 20,
                borderWidth: 2,
                borderColor: "rgba(255, 255, 255, 0.5)",
              }}
            >
              <Text
                style={{
                  color: "#FFF",
                  fontSize: 16,
                  fontWeight: "700",
                  letterSpacing: 0.5,
                }}
              >
                Continue
              </Text>
            </Pressable>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default CelebrationModal;
