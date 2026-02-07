import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { Video, ResizeMode, Audio } from "expo-av";
import ImageViewing from "react-native-image-viewing";
import { db } from "@/lib/firebase";

interface SheikhProfile {
  id: string;
  name: string;
  photo_url: string | null;
  biography: string;
}

interface SheikhStory {
  id: string;
  title: string;
  content: string;
  images: string[];
  videos: string[];
  publishDate: string;
}

export default function SheikhTab() {
  const [profile, setProfile] = useState<SheikhProfile | null>(null);
  const [stories, setStories] = useState<SheikhStory[]>([]);
  const [loading, setLoading] = useState(true);

  // video control
  const videoRefs = useRef<Record<string, Video | null>>({});
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [fullscreenVideo, setFullscreenVideo] = useState<string | null>(null);

  // image viewer
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [imageViewerImages, setImageViewerImages] = useState<
    { uri: string }[]
  >([]);

  // read more (stories)
  const [expandedStories, setExpandedStories] = useState<
    Record<string, boolean>
  >({});

  // read more (biography)
  const [bioExpanded, setBioExpanded] = useState(false);

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
    });

    const fetchData = async () => {
      try {
        // profile
        const profileSnap = await getDocs(collection(db, "sheikhProfile"));
        if (!profileSnap.empty) {
          const doc = profileSnap.docs[0];
          setProfile({ id: doc.id, ...(doc.data() as any) });
        }

        // stories
        const q = query(
          collection(db, "stories"),
          where("status", "==", "published"),
          orderBy("publishDate", "desc")
        );

        const snapshot = await getDocs(q);

        setStories(
          snapshot.docs.map((doc) => {
            const raw = doc.data() as any;
            return {
              id: doc.id,
              title: raw.title,
              content: raw.content,
              images: raw.images ?? [],
              videos: raw.videos ?? [],
              publishDate: raw.publishDate?.toDate
                ? raw.publishDate.toDate().toLocaleDateString("ar-EG")
                : "",
            };
          })
        );
      } catch (e) {
        console.error("Error fetching sheikh data:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const onScrollBegin = () => {
    Object.values(videoRefs.current).forEach((ref) => ref?.pauseAsync());
    setPlayingVideoId(null);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1F6F54" />
        <Text style={styles.loadingText}>جاري تحميل المحتوى...</Text>
      </View>
    );
  }

  if (!profile) return null;

  return (
    <>
      <FlatList
        data={stories}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={onScrollBegin}
        ListHeaderComponent={
          <View style={styles.profileCard}>
            {profile.photo_url && (
              <Image source={{ uri: profile.photo_url }} style={styles.avatar} />
            )}

            <View style={styles.divider} />

            <Text style={styles.sheikhName}>{profile.name}</Text>

            <Text style={styles.biography}>
              {bioExpanded
                ? profile.biography
                : profile.biography.slice(0, 180) +
                  (profile.biography.length > 180 ? "..." : "")}
            </Text>

            {profile.biography.length > 180 && (
              <TouchableOpacity onPress={() => setBioExpanded((p) => !p)}>
                <Text style={styles.readMore}>
                  {bioExpanded ? "إخفاء" : "اقرأ المزيد"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        }
        renderItem={({ item }) => {
          const expanded = expandedStories[item.id];
          const maxChars = 150;
          const showReadMore = item.content.length > maxChars;

          return (
            <View style={styles.card}>
              <Text style={styles.title}>{item.title}</Text>

              {/* Images */}
              {item.images.map((img, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    setImageViewerImages(
                      item.images.map((i) => ({ uri: i }))
                    );
                    setImageIndex(index);
                    setImageViewerVisible(true);
                  }}
                >
                  <Image source={{ uri: img }} style={styles.image} />
                </TouchableOpacity>
              ))}

              {/* Videos */}
              {item.videos.map((video, index) => {
                const videoId = `${item.id}-${index}`;
                const isPlaying = playingVideoId === videoId;

                return (
                  <View key={videoId}>
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={() =>
                        setPlayingVideoId(isPlaying ? null : videoId)
                      }
                    >
                      <Video
                        ref={(ref) => {
                            videoRefs.current[videoId] = ref;
                        }}
                        source={{ uri: video }}
                        style={styles.video}
                        resizeMode={ResizeMode.CONTAIN}
                        shouldPlay={isPlaying}
                        useNativeControls={false}
                        />

                      {!isPlaying && (
                        <View style={styles.playOverlay}>
                          <Text style={styles.playText}>▶ تشغيل</Text>
                        </View>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.fullscreenBtn}
                      onPress={() => setFullscreenVideo(video)}
                    >
                      <Text style={styles.fullscreenText}>⛶ ملء الشاشة</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}

              <Text style={styles.content}>
                {showReadMore && !expanded
                  ? item.content.slice(0, maxChars) + "..."
                  : item.content}
              </Text>

              {showReadMore && (
                <TouchableOpacity
                  onPress={() =>
                    setExpandedStories((prev) => ({
                      ...prev,
                      [item.id]: !prev[item.id],
                    }))
                  }
                >
                  <Text style={styles.readMore}>
                    {expanded ? "إخفاء" : "اقرأ المزيد"}
                  </Text>
                </TouchableOpacity>
              )}

              <Text style={styles.date}>{item.publishDate}</Text>
            </View>
          );
        }}
      />

      {/* 🖼 Image Viewer */}
      <ImageViewing
        images={imageViewerImages}
        imageIndex={imageIndex}
        visible={imageViewerVisible}
        onRequestClose={() => setImageViewerVisible(false)}
      />

      {/* 🎥 Fullscreen Video */}
      <Modal visible={!!fullscreenVideo} animationType="slide">
        <View style={styles.fullscreenVideoContainer}>
          <Video
            source={{ uri: fullscreenVideo || "" }}
            style={{ flex: 1 }}
            resizeMode={ResizeMode.CONTAIN}
            useNativeControls
            shouldPlay
          />
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setFullscreenVideo(null)}
          >
            <Text style={styles.closeText}>✕ إغلاق</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#F6F4EE",
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    backgroundColor: "#F6F4EE",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 8,
    color: "#1F6F54",
  },
  profileCard: {
    backgroundColor: "#5d4037",      // richer, darker header background
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },  
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginBottom: 16,
    borderWidth: 4,
    borderColor: "#f5d7a1",           // subtle golden border
    backgroundColor: "#fff",
  },  
  sheikhName: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#f5d7a1",                // golden text for elegance
    marginBottom: 12,
    textAlign: "center",
  },
  divider: {
    width: 60,
    height: 4,
    backgroundColor: "#f5d7a1",
    borderRadius: 2,
    marginVertical: 12,
  },
    
  biography: {
    textAlign: "right",
    lineHeight: 26,
    color: "#fff",                    // white on dark header
    backgroundColor: "rgba(0,0,0,0.2)",  // subtle overlay
    padding: 16,
    borderRadius: 16,
  },
  
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 28,
    borderColor: "#E6E1D6",
    borderWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F6F54",
    textAlign: "right",
    marginBottom: 10,
  },
  image: {
    width: "100%",
    height: 210,
    borderRadius: 14,
    marginBottom: 12,
  },
  video: {
    width: "100%",
    height: 230,
    borderRadius: 14,
    backgroundColor: "#000",
  },
  playOverlay: {
    position: "absolute",
    inset: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
    borderRadius: 14,
  },
  playText: {
    color: "#C9A24D",
    fontSize: 18,
    fontWeight: "700",
  },
  fullscreenBtn: {
    alignSelf: "flex-end",
    marginTop: 6,
  },
  fullscreenText: {
    color: "#1F6F54",
    fontWeight: "600",
  },
  content: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 24,
    textAlign: "right",
    color: "#1E1E1E",
  },
  readMore: {
    color: "#1F6F54",
    fontWeight: "600",
    marginTop: 4,
    textAlign: "right",
  },
  date: {
    marginTop: 6,
    fontSize: 12,
    textAlign: "right",
    color: "#777",
  },
  fullscreenVideoContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  closeBtn: {
    position: "absolute",
    top: 40,
    right: 20,
  },
  closeText: {
    color: "#fff",
    fontSize: 18,
  },
});
