import {
    View,
    Text,
    FlatList,
    Image,
    ActivityIndicator,
    StyleSheet,
    ScrollView,
    Modal,
    Pressable,
  } from "react-native";
  import { useEffect, useState } from "react";
  import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
  import { db } from "@/lib/firebase";
  
  interface Activity {
    id: string;
    title: string;
    description: string;
    content: string;
    date: any;
    images: string[];
  }
  
  export default function Activities() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
    useEffect(() => {
      const fetchActivities = async () => {
        try {
          setLoading(true);
  
          const q = query(
            collection(db, "activities"),
            where("status", "==", "published"),
            orderBy("date", "desc")
          );
  
          const snapshot = await getDocs(q);
  
          const data: Activity[] = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Activity[];
  
          setActivities(data);
        } catch (error) {
          console.error("خطأ أثناء جلب الأنشطة:", error);
        } finally {
          setLoading(false);
        }
      };
  
      fetchActivities();
    }, []);
  
    if (loading) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#166534" />
          <Text style={styles.loadingText}>جارٍ تحميل الأنشطة...</Text>
        </View>
      );
    }
  
    if (activities.length === 0) {
      return (
        <View style={styles.center}>
          <Text style={styles.emptyText}>لا توجد أنشطة حالياً</Text>
        </View>
      );
    }
  
    return (
      <>
        <FlatList
          data={activities}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.title}>{item.title}</Text>
  
              <Text style={styles.description}>{item.description}</Text>
  
              <Text style={styles.content}>{item.content}</Text>
  
              <Text style={styles.date}>
                🕌 تاريخ النشاط:{" "}
                {item.date?.toDate?.().toLocaleDateString("ar-LB")}
              </Text>
  
              {item.images && item.images.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.imageRow}
                >
                  {item.images.map((uri, index) => (
                    <Pressable key={index} onPress={() => setSelectedImage(uri)}>
                      <Image source={{ uri }} style={styles.image} />
                    </Pressable>
                  ))}
                </ScrollView>
              )}
            </View>
          )}
        />
  
        {/* Full screen image modal */}
        <Modal visible={!!selectedImage} transparent animationType="fade">
          <Pressable
            style={styles.modalContainer}
            onPress={() => setSelectedImage(null)}
          >
            <Image
              source={{ uri: selectedImage! }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          </Pressable>
        </Modal>
      </>
    );
  }
  const styles = StyleSheet.create({
    list: {
      padding: 16,
      backgroundColor: "#F0FDF4", // soft green mosque background
    },
  
    center: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
  
    loadingText: {
      marginTop: 10,
      fontSize: 14,
      color: "#166534",
    },
  
    emptyText: {
      fontSize: 16,
      color: "#14532D",
    },
  
    /* ===== Card ===== */
    card: {
      backgroundColor: "#FFFFFF",
      borderRadius: 18,
      marginBottom: 20,
      padding: 16,
      borderWidth: 1,
      borderColor: "#DCFCE7",
      elevation: 2,
    },
  
    title: {
      fontSize: 18,
      fontWeight: "700",
      color: "#14532D",
      textAlign: "right",
      marginBottom: 6,
    },
  
    description: {
      fontSize: 14,
      color: "#166534",
      textAlign: "right",
      marginBottom: 6,
      lineHeight: 20,
    },
  
    content: {
      fontSize: 14,
      color: "#365314",
      textAlign: "right",
      lineHeight: 22,
      marginBottom: 10,
    },
  
    date: {
      fontSize: 12,
      color: "#4D7C0F",
      textAlign: "right",
      marginBottom: 10,
    },
  
    imageRow: {
      marginTop: 6,
    },
  
    image: {
      width: 200,
      height: 120,
      borderRadius: 14,
      marginLeft: 10, // RTL spacing
    },
  
    /* ===== Image Modal ===== */
    modalContainer: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.92)",
      justifyContent: "center",
      alignItems: "center",
    },
  
    fullImage: {
      width: "100%",
      height: "100%",
    },
  });
    