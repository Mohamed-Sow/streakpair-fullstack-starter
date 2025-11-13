import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  Pressable,
  Modal,
  Dimensions,
  StyleSheet,
} from "react-native";
import { X, Calendar, User } from "lucide-react-native";
import type { RootStackScreenProps } from "@/navigation/types";

type Props = RootStackScreenProps<"PhotoGalleryScreen">;

const { width, height } = Dimensions.get("window");
const numColumns = 3;
const imageSize = (width - 40 - (numColumns - 1) * 8) / numColumns;

const PhotoGalleryScreen = ({ route, navigation }: Props) => {
  const { checkIns, streakName } = route.params;
  const [selectedPhoto, setSelectedPhoto] = useState<{
    url: string;
    date: string;
    note: string | null;
    userName: string | null;
  } | null>(null);

  // Filter check-ins with photos
  const photosData = useMemo(() => {
    return checkIns
      .filter((c) => c.photoUrl)
      .map((c) => ({
        id: c.id,
        url: c.photoUrl!,
        date: c.date,
        note: c.note,
        userName: c.user?.name ?? null,
      }))
      .sort((a, b) => b.date.localeCompare(a.date)); // Most recent first
  }, [checkIns]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const renderPhoto = ({ item }: { item: typeof photosData[0] }) => (
    <Pressable
      onPress={() => setSelectedPhoto(item)}
      style={{
        width: imageSize,
        height: imageSize,
        marginBottom: 8,
      }}
    >
      <Image
        source={{ uri: item.url }}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 12,
          backgroundColor: "#F3F4F6",
        }}
        resizeMode="cover"
      />
      <View
        style={{
          position: "absolute",
          bottom: 6,
          left: 6,
          right: 6,
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          borderRadius: 6,
          paddingHorizontal: 6,
          paddingVertical: 3,
        }}
      >
        <Text
          style={{
            color: "#FFF",
            fontSize: 10,
            fontWeight: "600",
            textAlign: "center",
          }}
        >
          {formatDate(item.date)}
        </Text>
      </View>
    </Pressable>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#FAFAFA" }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: "#FFF",
          padding: 20,
          paddingTop: 60,
          borderBottomWidth: 1,
          borderBottomColor: "#E5E7EB",
        }}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          style={{
            position: "absolute",
            top: 60,
            left: 20,
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "#F8F9FA",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <X color="#000" size={20} />
        </Pressable>
        <Text
          style={{
            fontSize: 24,
            fontWeight: "700",
            color: "#1F2937",
            textAlign: "center",
          }}
        >
          Photo Gallery
        </Text>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "500",
            color: "#6B7280",
            textAlign: "center",
            marginTop: 4,
          }}
        >
          {streakName} • {photosData.length} photos
        </Text>
      </View>

      {/* Gallery Grid */}
      {photosData.length > 0 ? (
        <FlatList
          data={photosData}
          renderItem={renderPhoto}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          contentContainerStyle={{
            padding: 20,
            paddingBottom: 40,
          }}
          columnWrapperStyle={{
            gap: 8,
          }}
        />
      ) : (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 40,
          }}
        >
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: "#F3F4F6",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <Calendar color="#9CA3AF" size={36} />
          </View>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              color: "#1F2937",
              marginBottom: 8,
            }}
          >
            No Photos Yet
          </Text>
          <Text
            style={{
              fontSize: 15,
              color: "#6B7280",
              textAlign: "center",
              lineHeight: 22,
            }}
          >
            Check-in photos will appear here
          </Text>
        </View>
      )}

      {/* Photo Detail Modal */}
      <Modal
        visible={!!selectedPhoto}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedPhoto(null)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.95)",
          }}
        >
          {/* Close Button */}
          <Pressable
            onPress={() => setSelectedPhoto(null)}
            style={{
              position: "absolute",
              top: 60,
              right: 20,
              zIndex: 10,
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X color="#FFF" size={24} />
          </Pressable>

          {selectedPhoto && (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                padding: 20,
              }}
            >
              {/* Photo */}
              <Image
                source={{ uri: selectedPhoto.url }}
                style={{
                  width: width - 40,
                  height: width - 40,
                  borderRadius: 20,
                }}
                resizeMode="cover"
              />

              {/* Info Card */}
              <View
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  borderRadius: 20,
                  padding: 20,
                  marginTop: 20,
                  width: width - 40,
                }}
              >
                {/* Date */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: "#F3F4F6",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                    }}
                  >
                    <Calendar color="#6B7280" size={18} />
                  </View>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: "#1F2937",
                    }}
                  >
                    {formatDate(selectedPhoto.date)}
                  </Text>
                </View>

                {/* User */}
                {selectedPhoto.userName && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: selectedPhoto.note ? 12 : 0,
                    }}
                  >
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        backgroundColor: "#F3F4F6",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 12,
                      }}
                    >
                      <User color="#6B7280" size={18} />
                    </View>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "600",
                        color: "#1F2937",
                      }}
                    >
                      {selectedPhoto.userName}
                    </Text>
                  </View>
                )}

                {/* Note */}
                {selectedPhoto.note && (
                  <View
                    style={{
                      backgroundColor: "#F9FAFB",
                      borderRadius: 12,
                      padding: 12,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        color: "#4B5563",
                        lineHeight: 20,
                      }}
                    >
                      {selectedPhoto.note}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
};

export default PhotoGalleryScreen;
