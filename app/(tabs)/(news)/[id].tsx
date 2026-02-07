import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  Image,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowRight } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { SafeAreaView } from "react-native-safe-area-context";
import { Video, ResizeMode, Audio } from "expo-av";
import ImageViewing from "react-native-image-viewing";

interface NewsItem {
  id: string;
  title: string;
  date: string;
  content: string;
  media?: Array<{ type: "image" | "video"; url: string }>;
}

export default function NewsDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [newsItem, setNewsItem] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);

  // Video refs and state
  const videoRefs = useRef<Record<string, Video | null>>({});
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState<Record<string, boolean>>(
    {}
  );
  const [fullscreenVideo, setFullscreenVideo] = useState<string | null>(null);
  const [fullscreenVideoLoading, setFullscreenVideoLoading] = useState(true);

  // Image viewer state
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [imageViewerImages, setImageViewerImages] = useState<{ uri: string }[]>(
    []
  );

  useEffect(() => {
    if (!id) return;

    // Required for Android video playback
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
    });

    const fetchNews = async () => {
      try {
        const ref = doc(db, "news", id);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          setNewsItem(null);
          return;
        }

        const data = snap.data() as any;

        setNewsItem({
          id: snap.id,
          title: data.title,
          content: data.content,
          media: (data.mediaUrls || []).map((url: string) => ({
            type: url.endsWith(".mp4") ? "video" : "image",
            url,
          })),
          date: data.date?.toDate
            ? data.date.toDate().toLocaleDateString("ar-EG")
            : "",
        });
      } catch (error) {
        console.error("Error fetching news details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [id]);

  // Pause all videos when scrolling
  const onScrollBegin = () => {
    Object.values(videoRefs.current).forEach((ref) => ref?.pauseAsync());
    setPlayingVideoId(null);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#1F6F54" />
          <Text style={styles.loadingText}>جاري تحميل الخبر...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!newsItem) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.center}>
          <Text style={styles.errorText}>الخبر غير موجود</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          style={styles.backButton}
        >
          <ArrowRight size={24} color="#333" />
        </Pressable>
        <Text style={styles.headerTitle}>تفاصيل الخبر</Text>
      </View>

      {/* CONTENT */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={onScrollBegin}
      >
        <View style={styles.newsCard}>
          <Text style={styles.newsTitle}>{newsItem.title}</Text>
          <Text style={styles.newsDate}>{newsItem.date}</Text>
          <View style={styles.divider} />

          {/* Media Section */}
          {newsItem.media?.map((m, i) => {
            if (m.type === "image") {
              return (
                <TouchableOpacity
                  key={i}
                  onPress={() => {
                    const images = newsItem.media!
                      .filter((x) => x.type === "image")
                      .map((x) => ({ uri: x.url }));
                    setImageViewerImages(images);
                    setImageIndex(
                      images.findIndex((x) => x.uri === m.url)
                    );
                    setImageViewerVisible(true);
                  }}
                >
                  <Image
                    source={{ uri: m.url }}
                    style={styles.newsImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              );
            } else if (m.type === "video") {
              const videoId = `${newsItem.id}-${i}`;
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
                      source={{ uri: m.url }}
                      style={styles.newsVideo}
                      resizeMode={ResizeMode.CONTAIN}
                      shouldPlay={isPlaying}
                      useNativeControls={true}
                      onLoadStart={() =>
                        setVideoLoading((prev) => ({ ...prev, [videoId]: true }))
                      }
                      onLoad={() =>
                        setVideoLoading((prev) => ({ ...prev, [videoId]: false }))
                      }
                      onError={(e) => {
                        console.error("Video load error:", e);
                        setVideoLoading((prev) => ({ ...prev, [videoId]: false }));
                      }}
                    />

                    {/* Loading spinner */}
                    {videoLoading[videoId] && (
                      <View style={styles.playOverlay}>
                        <ActivityIndicator size="large" color="#C9A24D" />
                      </View>
                    )}

                    {/* Play overlay */}
                    {!isPlaying && !videoLoading[videoId] && (
                      <View style={styles.playOverlay}>
                        <Text style={styles.playText}>▶ تشغيل</Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.fullscreenBtn}
                    onPress={() => {
                      setFullscreenVideo(m.url);
                      setFullscreenVideoLoading(true);
                    }}
                  >
                    <Text style={styles.fullscreenText}>⛶ ملء الشاشة</Text>
                  </TouchableOpacity>
                </View>
              );
            }
          })}

          <Text style={styles.newsContent}>{newsItem.content}</Text>
        </View>
      </ScrollView>

      {/* 🖼 Fullscreen Image Viewer */}
      <ImageViewing
        images={imageViewerImages}
        imageIndex={imageIndex}
        visible={imageViewerVisible}
        onRequestClose={() => setImageViewerVisible(false)}
      />

      {/* 🎥 Fullscreen Video Modal */}
      <Modal visible={!!fullscreenVideo} animationType="slide">
        <View style={styles.fullscreenVideoContainer}>
          {fullscreenVideoLoading && (
            <View style={styles.fullscreenLoading}>
              <ActivityIndicator size="large" color="#C9A24D" />
            </View>
          )}
          <Video
            source={{ uri: fullscreenVideo || "" }}
            style={{ flex: 1 }}
            resizeMode={ResizeMode.CONTAIN}
            useNativeControls
            shouldPlay
            onLoadStart={() => setFullscreenVideoLoading(true)}
            onLoad={() => setFullscreenVideoLoading(false)}
            onError={(e) => {
              console.error("Fullscreen video error:", e);
              setFullscreenVideoLoading(false);
            }}
          />
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setFullscreenVideo(null)}
          >
            <Text style={styles.closeText}>✕ إغلاق</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f6f5" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 8, color: "#1F6F54" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    zIndex: 10,
  },
  backButton: { padding: 12, marginRight: 12 },
  headerTitle: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 18,
    fontFamily: "Cairo-Bold",
    color: "#222",
  },
  content: { flex: 1, margin: 16 },
  newsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingVertical: 22,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  newsTitle: { fontSize: 22, fontFamily: "Cairo-Bold", color: "#1f2937", marginBottom: 10, textAlign: "center", lineHeight: 32 },
  newsDate: { fontSize: 20, fontFamily: "Cairo-Regular", color: "#8a8a8a", textAlign: "center", marginBottom: 14 },
  divider: { height: 1, backgroundColor: "#e5e7eb", marginVertical: 18 },
  newsContent: { fontSize: 16, fontFamily: "Cairo-Regular", color: "#374151", lineHeight: 28, textAlign: "center" },
  newsImage: { width: "100%", height: 200, borderRadius: 12, marginBottom: 16 },
  newsVideo: { width: "100%", height: 250, borderRadius: 12, backgroundColor: "#000", marginBottom: 16 },
  playOverlay: { position: "absolute", inset: 0, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.35)", borderRadius: 12 },
  playText: { color: "#C9A24D", fontSize: 18, fontWeight: "700" },
  fullscreenBtn: { alignSelf: "flex-end", marginBottom: 16 },
  fullscreenText: { color: "#1F6F54", fontWeight: "600" },
  fullscreenVideoContainer: { flex: 1, backgroundColor: "#000" },
  fullscreenLoading: { position: "absolute", inset: 0, justifyContent: "center", alignItems: "center", zIndex: 10 },
  closeBtn: { position: "absolute", top: 40, right: 20 },
  closeText: { color: "#fff", fontSize: 18 },
  errorText: { fontSize: 16, fontFamily: "Cairo-Regular", color: "#6b7280", textAlign: "center", marginTop: 24, lineHeight: 24 },
});
