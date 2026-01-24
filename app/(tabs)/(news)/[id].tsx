import { View, ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface NewsItem {
  id: string;
  title: string;
  date: string;
  content: string;
}

export default function NewsDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [newsItem, setNewsItem] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchNews = async () => {
      try {
        const ref = doc(db, 'news', id);
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
          date: data.date?.toDate
            ? data.date.toDate().toLocaleDateString('ar-EG')
            : '',
        });
      } catch (error) {
        console.error('Error fetching news details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>جاري تحميل الخبر...</Text>
      </View>
    );
  }

  if (!newsItem) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>الخبر غير موجود</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowRight size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>تفاصيل الخبر</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.newsCard}>
          <Text style={styles.newsTitle}>{newsItem.title}</Text>
          <Text style={styles.newsDate}>{newsItem.date}</Text>
          <View style={styles.divider} />
          <Text style={styles.newsContent}>{newsItem.content}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 0,
  },
  backButton: {
    padding: 8,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Cairo-Bold',
    color: '#333',
    flex: 1,
    textAlign: 'right',
    marginRight: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  newsCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
  },
  newsTitle: {
    fontSize: 22,
    fontFamily: 'Cairo-Bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'right',
  },
  newsDate: {
    fontSize: 13,
    fontFamily: 'Cairo-Regular',
    color: '#999',
    textAlign: 'right',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
  },
  newsContent: {
    fontSize: 16,
    fontFamily: 'Cairo-Regular',
    color: '#555',
    lineHeight: 26,
    textAlign: 'right',
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Cairo-Regular',
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});
