import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Card from '@/components/ui/Card';

const StreaksScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Streaks</Text>
      <Card>
        <Text>Your active streaks will appear here.</Text>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
});

export default StreaksScreen;