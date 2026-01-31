import { View, ScrollView, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, AlertCircle } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SafeAreaView } from 'react-native-safe-area-context';

interface NewsItem {
  id: string;
  title: string;
  date: string;
  description: string;
  content: string;
  isUrgent: boolean;
  category: string;
}

export default function NewsList() {
  const router = useRouter();

  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState('News');

  const categories = [
    { key: 'News', label: '📰 الأخبار' },
    { key: 'Mosque', label: '🕌 الأنشطة المسجدية' },
    { key: 'Religious', label: '📚 المواضيع الدينية' },
    { key: 'Village', label: '🕰️ ذكريات القرية' },
    { key: 'Jobs', label: '💼 الوظائف' },
  ];

  const categoryCollections: Record<string, string> = {
    News: 'news',
    Mosque: 'activities',
    Religious: 'topics',
    Village: 'memories',
    Jobs: 'jobs',
  };

  useEffect(() => {
    const fetchCategoryNews = async () => {
      try {
        setLoading(true);
        const collectionName = categoryCollections[selectedCategory] || 'news';
        const q = query(collection(db, collectionName), orderBy('date' , 'desc'));

        const snapshot = await getDocs(q);

        const data: NewsItem[] = snapshot.docs.map(doc => {
          const raw = doc.data() as any;
          return {
            id: doc.id,
            title: raw.title,
            description: raw.description,
            content: raw.content,
            isUrgent: raw.isUrgent,
            category: selectedCategory,
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

    fetchCategoryNews();
  }, [selectedCategory]);

  const urgentNews = news.filter(item => item.isUrgent);
  const announcements = news.filter(item => !item.isUrgent);

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
        <Text style={{ textAlign: 'center', marginTop: 10 }}>جاري تحميل الأخبار...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>الأخبار</Text>
      </View>

      {/* Categories */}
      <View style={{ height: 60 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryContainer}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={true}
        >
          {categories.map(cat => (
            <TouchableOpacity
              key={cat.key}
              activeOpacity={0.7}
              style={[
                styles.categoryButton,
                selectedCategory === cat.key && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(cat.key)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === cat.key && styles.categoryTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* News List */}
      {
        news.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>لا توجد أخبار في هذا القسم.</Text>
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
