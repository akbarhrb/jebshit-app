import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'expo-router';
import { AlertCircle, ChevronLeft } from 'lucide-react-native';

interface NewsItem {
  id: string;
  title: string;
  date: string;
  description: string;
  content: string;
  isUrgent: boolean;
  category: string;
}

export default function NewsCategory() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const q = query(collection(db, 'news'), orderBy('date', 'desc'));
        const snapshot = await getDocs(q);
        const data: NewsItem[] = snapshot.docs.map(doc => {
          const raw = doc.data() as any;
          return {
            id: doc.id,
            title: raw.title,
            description: raw.description,
            content: raw.content,
            isUrgent: raw.isUrgent ?? false,
            category: 'News',
            date: raw.date?.toDate ? raw.date.toDate().toLocaleDateString('ar-EG') : '',
          };
        });
        setNews(data);
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  const urgentNews = news.filter(item => item.isUrgent);
  const announcements = news.filter(item => !item.isUrgent);

  const renderNewsItem = (item: NewsItem, isUrgent = false) => (
    <TouchableOpacity
      key={item.id}
      onPress={() => router.push(`/(tabs)/(news)/${item.id}`)}
      style={[styles.newsItem, isUrgent && styles.urgentNewsItem]}
    >
      <View style={styles.newsItemContent}>
        <Text style={styles.newsTitle}>{item.title}</Text>
        <Text style={styles.newsDate}>{item.date}</Text>
        <Text style={styles.newsDescription} numberOfLines={2}>
          {item.description}
        </Text>
      </View>
      {isUrgent ? (
        <AlertCircle size={20} color="#d32f2f" style={styles.icon} />
      ) : (
        <ChevronLeft size={20} color="#666" style={styles.icon} />
      )}
    </TouchableOpacity>
  );

  if (loading) return <Text style={{ textAlign: 'center', marginTop: 20 }}>جارٍ التحميل...</Text>;

  return (
    <ScrollView style={{ margin: 10 }}>
      {urgentNews.length > 0 && (
        <View>
          <Text style={styles.sectionTitle}>الأخبار العاجلة</Text>
          {urgentNews.map(item => renderNewsItem(item, true))}
        </View>
      )}
      {announcements.length > 0 && (
        <View>
          <Text style={styles.sectionTitle}>التبليغات والأنشطة</Text>
          {announcements.map(item => renderNewsItem(item))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  newsItem: { flexDirection: 'row-reverse', alignItems: 'center', padding: 14, borderRadius: 10, backgroundColor: '#f9f9f9', marginBottom: 10 },
  urgentNewsItem: { backgroundColor: '#fdecea' },
  newsItemContent: { flex: 1 },
  newsTitle: { fontWeight: 'bold', fontSize: 15, marginBottom: 4 },
  newsDate: { fontSize: 12, color: '#777', marginBottom: 6 },
  newsDescription: { fontSize: 13, color: '#555' },
  icon: { marginLeft: 10 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
});
