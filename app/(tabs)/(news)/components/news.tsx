import { NewsItem } from "@/data/news";
import { useRouter } from "expo-router";
import { AlertCircle, ChevronLeft } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, TouchableOpacity, StyleSheet , Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function News() {
    const [loading, setLoading] = useState(true);
    const [news, setNews] = useState<NewsItem[]>([]);

    const urgentNews = news.filter(item => item.isUrgent);
    const announcements = news.filter(item => !item.isUrgent);

    const router = useRouter();

      useEffect(() => {
        const fetchNews = async () => {
          try {
            setLoading(true);
            const collectionName = 'news';
            const q = query(collection(db, collectionName), orderBy('isUrgent' , 'desc'));
    
            const snapshot = await getDocs(q);
    
            const data: NewsItem[] = snapshot.docs.map(doc => {
              const raw = doc.data() as any;
              return {
                id: doc.id,
                title: raw.title,
                description: raw.description,
                content: raw.content,
                isUrgent: raw.isUrgent,
                date: raw.date?.toDate ? raw.date.toDate().toLocaleDateString('ar-EG') : '',
              };
            });
    
            setNews(data);
          } catch (error) {
            console.error('Error fetching news:', error);
            setNews([]);
          } finally {
            setLoading(false);
          }
        };
    
        fetchNews();
      }, []);
    
    
    const renderNewsItem = (item: NewsItem, isUrgent = false) => (
        <TouchableOpacity
          key={item.id}
          activeOpacity={0.7}
          onPress={() => router.push(`/(tabs)/(news)/${item.id}`)}
          style={[styles.newsItem, isUrgent && styles.urgentNewsItem]}
        >
          <View style={styles.newsItemContent}>
            <Text style={styles.newsTitle}>{item.title}</Text>
            <Text style={styles.newsDate}>{item.date || 'تاريخ غير متوفر'}</Text>
            <Text style={styles.newsDescription} numberOfLines={2}>
              {item.description}
            </Text>
          </View>
          {isUrgent ? (
            <AlertCircle size={20} color="#d32f2f" style={styles.urgentIcon} />
          ) : (
            <ChevronLeft size={20} color="#666" style={styles.chevron} />
          )}
        </TouchableOpacity>
    );
    

    if (loading) {
        return (
          <SafeAreaView style={styles.container}>
            <ActivityIndicator size="large" color="#2e7d32" style={{ marginTop: 20 }} />
            <Text>جاري تحميل الأخبار...</Text>
          </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* News List */}
            {
                news.length === 0 ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Text>لا توجد أخبار حالياً.</Text>
                    </View>
                    ) :
                    <ScrollView
                        style={{ flex: 1 }}
                        contentContainerStyle={{ paddingBottom: 20 }}
                        keyboardShouldPersistTaps="handled"
                        nestedScrollEnabled={true}
                        >
                        {urgentNews.length > 0 && (
                            <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>الأخبار العاجلة</Text>
                            </View>
                            <View style={styles.sectionContent}>
                                {urgentNews.map(item => renderNewsItem(item, true))}
                            </View>
                            </View>
                        )}
                
                        {announcements.length > 0 && (
                            <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>التبليغات والأنشطة</Text>
                            </View>
                            <View style={styles.sectionContent}>
                                {announcements.map(item => renderNewsItem(item))}
                            </View>
                            </View>
                        )}
                        </ScrollView>
            }
        </SafeAreaView>  
    );
}
    
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center' },

  // Category
  categoryContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  categoryButton: {
    backgroundColor: '#f1f1f1',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginLeft: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#2e7d32',
  },
  categoryText: {
    fontSize: 18,
    color: '#555',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  categoryTextActive: {
    color: '#fff',
  },

  list: { paddingHorizontal: 10, marginTop: 10 },
  section: { margin: 10 , marginTop: 20},
  sectionHeader: { marginBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', textAlign: 'right' },
  sectionContent: { gap: 10 },
  newsItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
    textAlign: 'right',
  },
  urgentNewsItem: { backgroundColor: '#fdecea' },
  newsItemContent: { flex: 1 },
  newsTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 4, textAlign: 'right' },
  newsDate: { fontSize: 12, color: '#777', marginBottom: 6, textAlign: 'right' },
  newsDescription: { fontSize: 13, color: '#555', textAlign: 'right' },
  chevron: { marginLeft: 10 },
  urgentIcon: { marginLeft: 10 },
});
