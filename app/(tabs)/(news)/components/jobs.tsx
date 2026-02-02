import { View, Text, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  jobType: string;
  contactInfo: string;
  publishDate: any;
}

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);

        const q = query(
          collection(db, "jobs"),
          where("status", "==", "published"),
          orderBy("publishDate", "desc")
        );

        const snapshot = await getDocs(q);

        const data: Job[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Job[];

        setJobs(data);
      } catch (error) {
        console.error("خطأ أثناء جلب الوظائف:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>جارٍ تحميل الوظائف...</Text>
      </View>
    );
  }

  if (jobs.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>لا توجد وظائف متاحة حالياً</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={jobs}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <View style={styles.card}>
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{item.title}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {translateJobType(item.jobType)}
              </Text>
            </View>
          </View>

          {/* Body */}
          <Text style={styles.description}>{item.description}</Text>

          <Text style={styles.meta}>📍 الموقع: {item.location}</Text>
          <Text style={styles.meta}>📞 للتواصل: {item.contactInfo}</Text>

          {/* Footer */}
          <Text style={styles.date}>
            تاريخ النشر: {item.publishDate?.toDate?.().toLocaleDateString("ar-LB")}
          </Text>
        </View>
      )}
    />
  );
}

// Translate job types to Arabic
function translateJobType(type: string) {
  switch (type) {
    case "full-time":
      return "دوام كامل";
    case "part-time":
      return "دوام جزئي";
    case "remote":
      return "عن بُعد";
    default:
      return type;
  }
}
const styles = StyleSheet.create({
    list: {
      padding: 16,
      backgroundColor: "#fff",
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
      color: "#2563EB",
    },
  
    emptyText: {
      fontSize: 16,
      color: "#777",
    },
  
    /* ===== Card ===== */
    card: {
      backgroundColor: "#FFFFFF",
      borderRadius: 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: "#E5E7EB",
      overflow: "hidden",
      elevation: 4,
    },
  
    /* Header section */
    header: {
      backgroundColor: "#2563EB",
      padding: 14,
      flexDirection: "row-reverse",
      justifyContent: "space-between",
      alignItems: "center",
    },
  
    title: {
      fontSize: 17,
      fontWeight: "700",
      color: "#FFFFFF",
      flex: 1,
      textAlign: "right",
    },
  
    badge: {
      backgroundColor: "#DBEAFE",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 20,
      marginLeft: 8,
    },
  
    badgeText: {
      fontSize: 12,
      fontWeight: "600",
      color: "#1E3A8A",
    },
  
    /* Body */
    description: {
      padding: 14,
      paddingBottom: 6,
      fontSize: 14,
      color: "#374151",
      textAlign: "right",
      lineHeight: 20,
    },
  
    meta: {
      paddingHorizontal: 14,
      paddingBottom: 6,
      fontSize: 13,
      color: "#4B5563",
      textAlign: "right",
    },
  
    /* Footer */
    date: {
      padding: 12,
      fontSize: 12,
      color: "#6B7280",
      textAlign: "left",
      backgroundColor: "#F9FAFB",
      borderTopWidth: 1,
      borderTopColor: "#E5E7EB",
    },
  });
  