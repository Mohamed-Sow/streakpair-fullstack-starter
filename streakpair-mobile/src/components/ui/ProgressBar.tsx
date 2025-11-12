import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ProgressBarProps {
  progress: number; // 0 to 1
  height?: number;
  backgroundColor?: string;
  colors?: string[];
  borderRadius?: number;
  showPercentage?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 8,
  backgroundColor = '#e2e8f0',
  colors = ['#0891b2', '#0e7490'],
  borderRadius = 4,
  showPercentage = false,
}) => {
  const progressPercentage = Math.min(Math.max(progress, 0), 1);

  return (
    <View style={[styles.container, { height, borderRadius, backgroundColor }]}>
      <View
        style={[
          styles.progress,
          {
            width: `${progressPercentage * 100}%`,
            borderRadius,
          },
        ]}
      >
        <LinearGradient
          colors={colors}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
      </View>
      {showPercentage && (
        <Text style={styles.percentageText}>
          {Math.round(progressPercentage * 100)}%
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
  progress: {
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
  },
  gradient: {
    width: '100%',
    height: '100%',
  },
  percentageText: {
    position: 'absolute',
    right: 8,
    top: '50%',
    transform: [{ translateY: -8 }],
    fontSize: 10,
    fontWeight: '600',
    color: '#1e293b',
  },
});

export default ProgressBar;