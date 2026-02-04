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
  
  interface Topic {
    id: string;
    title: string;
    description: string;
    content: string;
    images: string[];
    videos: string[];
    publishDate: any;
    status: string;
  }
  
  export default function Topics() {
    const [topics, setTopics] = useState<Topic[]>([]);
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
  
    useEffect(() => {
      // required for Android video playback
      Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
      });
  
      const fetchTopics = async () => {
        try {
          const q = query(
            collection(db, "topics"),
            where("status", "==", "published"),
            orderBy("publishDate", "desc")
          );
  
          const snapshot = await getDocs(q);
  
          setTopics(
            snapshot.docs.map((doc) => ({
              id: doc.id,
              ...(doc.data() as Omit<Topic, "id">),
            }))
          );
        } catch (err) {
          console.error("Error fetching topics:", err);
        } finally {
          setLoading(false);
        }
      };
  
      fetchTopics();
    }, []);
  
    // pause all videos when scrolling
    const onScrollBegin = () => {
      Object.values(videoRefs.current).forEach((ref) => ref?.pauseAsync());
      setPlayingVideoId(null);
    };
  
    if (loading) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#1F6F54" />
          <Text style={styles.loadingText}>جاري تحميل المحتوى الديني...</Text>
        </View>
      );
    }
  
    return (
      <>
        <FlatList
          data={topics}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          onScrollBeginDrag={onScrollBegin}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.header}>
                <View style={styles.goldLine} />
                <Text style={styles.title}>{item.title}</Text>
              </View>
  
              {/* Images */}
              {item.images?.map((img, index) => (
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
              {item.videos?.map((video, index) => {
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
                      <Text style={styles.fullscreenText}>
                        ⛶ ملء الشاشة
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
  
              <Text style={styles.description}>{item.description}</Text>
              <Text style={styles.content}>{item.content}</Text>
            </View>
          )}
        />
  
        {/* 🖼 Fullscreen Image Viewer */}
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
    card: {
      backgroundColor: "#FFFFFF",
      borderRadius: 16,
      padding: 18,
      marginBottom: 28,
      borderColor: "#E6E1D6",
      borderWidth: 1,
    },
    header: {
      alignItems: "flex-end",
      marginBottom: 12,
    },
    goldLine: {
      width: 40,
      height: 3,
      backgroundColor: "#C9A24D",
      marginBottom: 6,
      borderRadius: 2,
    },
    title: {
      fontSize: 18,
      fontWeight: "700",
      color: "#1F6F54",
      textAlign: "right",
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
    description: {
      marginTop: 10,
      color: "#5F5F5F",
      textAlign: "right",
    },
    content: {
      marginTop: 6,
      fontSize: 15,
      lineHeight: 24,
      textAlign: "right",
      color: "#1E1E1E",
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
  