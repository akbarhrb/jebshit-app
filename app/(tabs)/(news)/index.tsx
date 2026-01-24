import { View, ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, AlertCircle } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface NewsItem {
  id: string;
  title: string;
  date: string;
  description: string;
  content: string;
  isUrgent: boolean;
}

export default function NewsList() {
  const router = useRouter();

  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    
    const fetchNews = async () => {
      try {
        setLoading(true);
        const q = query(
          collection(db, 'news'),
          orderBy('isUrgent', 'desc')
        );

        const snapshot = await getDocs(q);

        const data: NewsItem[] = snapshot.docs.map(doc => {
        const raw = doc.data() as any;

        return {
          id: doc.id,
          title: raw.title,
          description: raw.description,
          content: raw.content,
          isUrgent: raw.isUrgent,
          date: raw.date?.toDate
            ? raw.date.toDate().toLocaleDateString('ar-EG')
            : '',
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
        <AlertCircle size={20} color="#d32f2f" style={styles.urgentIcon} />
      ) : (
        <ChevronLeft size={20} color="#666" style={styles.chevron} />
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center', marginTop: 20 }}>
          جاري تحميل الأخبار...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>الأخبار</Text>
      </View>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  list: {
    paddingHorizontal: 16,
  },
  section: {
    marginTop: 20,
  },
  sectionHeader: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionContent: {
    gap: 10,
  },
  newsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
  },
  urgentNewsItem: {
    backgroundColor: '#fdecea',
  },
  newsItemContent: {
    flex: 1,
  },
  newsTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  newsDate: {
    fontSize: 12,
    color: '#777',
    marginBottom: 6,
  },
  newsDescription: {
    fontSize: 13,
    color: '#555',
  },
  chevron: {
    marginLeft: 10,
  },
  urgentIcon: {
    marginLeft: 10,
  },
});
