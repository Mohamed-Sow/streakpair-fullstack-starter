import React, { useEffect, useRef } from "react";
import { View, Animated } from "react-native";

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = "100%",
  height = 20,
  borderRadius = 8,
  style,
}) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: "#E5E7EB",
          opacity,
        },
        style,
      ]}
    />
  );
};

export const StreakCardSkeleton: React.FC = () => {
  return (
    <View
      style={{
        backgroundColor: "#FFF",
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3,
      }}
    >
      {/* Header Row */}
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
        <SkeletonLoader width={48} height={48} borderRadius={24} style={{ marginRight: 12 }} />
        <View style={{ flex: 1 }}>
          <SkeletonLoader width="60%" height={18} style={{ marginBottom: 6 }} />
          <SkeletonLoader width="40%" height={14} />
        </View>
        <SkeletonLoader width={60} height={32} borderRadius={12} />
      </View>

      {/* Mini Chart */}
      <View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
          <SkeletonLoader width={80} height={10} />
          <SkeletonLoader width={40} height={10} />
        </View>
        <View style={{ flexDirection: "row", gap: 6 }}>
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <View key={i} style={{ flex: 1, alignItems: "center" }}>
              <SkeletonLoader width="100%" height={Math.random() > 0.5 ? 40 : 8} borderRadius={6} style={{ marginBottom: 6 }} />
              <SkeletonLoader width={12} height={10} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};
