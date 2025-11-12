import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';

import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { AppError, getErrorMessage } from '@/utils/errors';

interface CheckInModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (proofText: string, proofImage?: string) => Promise<void>;
  streakTitle?: string;
}

const CheckInModal: React.FC<CheckInModalProps> = ({
  visible,
  onClose,
  onSubmit,
  streakTitle = 'your streak',
}) => {
  const [proofText, setProofText] = useState('');
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePickImage = async () => {
    try {
      // Request permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert(
          'Permission Required',
          'Please grant camera roll permissions to upload photos.'
        );
        return;
      }

      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProofImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleTakePhoto = async () => {
    try {
      // Request permissions
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert(
          'Permission Required',
          'Please grant camera permissions to take photos.'
        );
        return;
      }

      // Take photo
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProofImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const handleSubmit = async () => {
    if (!proofText.trim() && !proofImage) {
      Alert.alert(
        'Check-in Required',
        'Please add either text or photo proof for your check-in.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(proofText, proofImage || undefined);

      // Reset form
      setProofText('');
      setProofImage(null);

      onClose();
    } catch (error) {
      const appError = error as AppError;
      Alert.alert('Check-in Failed', getErrorMessage(appError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setProofText('');
      setProofImage(null);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Check In</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.streakInfo}>
            <Text style={styles.streakTitle}>{streakTitle}</Text>
            <Text style={styles.streakSubtitle}>
              Add proof to complete today's check-in
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How did you do today?</Text>
            <Input
              value={proofText}
              onChangeText={setProofText}
              placeholder="Describe your progress, challenges, or achievements..."
              multiline
              numberOfLines={4}
              style={styles.textInput}
              inputStyle={styles.textInputStyle}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Add Photo Evidence (Optional)</Text>

            {proofImage ? (
              <View style={styles.imageContainer}>
                <Image source={{ uri: proofImage }} style={styles.image} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => setProofImage(null)}
                >
                  <Text style={styles.removeImageText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.imageButtons}>
                <TouchableOpacity
                  style={styles.imageButton}
                  onPress={handlePickImage}
                >
                  <LinearGradient
                    colors={['#0891b2', '#0e7490']}
                    style={styles.imageButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.imageButtonText}>📷 Choose Photo</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.imageButton, styles.takePhotoButton]}
                  onPress={handleTakePhoto}
                >
                  <Text style={styles.takePhotoButtonText}>📸 Take Photo</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.footer}>
            <Button
              title="Complete Check-in"
              onPress={handleSubmit}
              loading={isSubmitting}
              size="large"
              style={styles.submitButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#64748b',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  streakInfo: {
    alignItems: 'center',
    marginBottom: 32,
  },
  streakTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  streakSubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  textInput: {
    marginBottom: 0,
  },
  textInputStyle: {
    height: 100,
    textAlignVertical: 'top',
  },
  imageContainer: {
    alignItems: 'center',
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  removeImageButton: {
    padding: 8,
  },
  removeImageText: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '500',
  },
  imageButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  imageButton: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 12,
    overflow: 'hidden',
  },
  imageButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  takePhotoButton: {
    borderWidth: 2,
    borderColor: '#0891b2',
    backgroundColor: '#ffffff',
    paddingVertical: 14,
    alignItems: 'center',
  },
  imageButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  takePhotoButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0891b2',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 20,
  },
  submitButton: {
    shadowColor: '#0891b2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
});

export default CheckInModal;