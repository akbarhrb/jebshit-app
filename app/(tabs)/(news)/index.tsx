import { View, ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, AlertCircle } from 'lucide-react-native';
import { newsData } from '@/data/news';

export default function NewsList() {
  const router = useRouter();

  const urgentNews = newsData.filter((item) => item.isUrgent);
  const announcements = newsData.filter((item) => !item.isUrgent);

  const renderNewsItem = (item: typeof newsData[0], isUrgent: boolean = false) => (
    <TouchableOpacity
      key={item.id}
      onPress={() => router.push(`/(tabs)/(news)/${item.id}`)}
      style={[styles.newsItem, isUrgent && styles.urgentNewsItem]}>
      <View style={styles.newsItemContent}>
        <Text style={styles.newsTitle}>{item.title}</Text>
        <Text style={styles.newsDate}>{item.date}</Text>
        <Text style={styles.newsDescription} numberOfLines={2}>
          {item.description}
        </Text>
      </View>
      {isUrgent && <AlertCircle size={20} color="#d32f2f" style={styles.urgentIcon} />}
      {!isUrgent && <ChevronLeft size={20} color="#666" style={styles.chevron} />}
    </TouchableOpacity>
  );

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
              {urgentNews.map((item) => renderNewsItem(item, true))}
            </View>
          </View>
        )}

        {announcements.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>التبليغات والأنشطة</Text>
            </View>
            <View style={styles.sectionContent}>
              {announcements.map((item) => renderNewsItem(item, false))}
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginTop: 0,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Cairo-Bold',
    color: '#333',
    textAlign: 'right',
  },
  list: {
    flex: 1,
    padding: 12,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
    borderRightWidth: 4,
    borderRightColor: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Cairo-Bold',
    color: '#333',
    textAlign: 'right',
  },
  sectionContent: {
    gap: 12,
  },
  newsItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  urgentNewsItem: {
    backgroundColor: '#fff3e0',
    borderLeftWidth: 4,
    borderLeftColor: '#d32f2f',
    borderRightWidth: 0,
  },
  newsItemContent: {
    flex: 1,
    marginRight: 12,
  },
  newsTitle: {
    fontSize: 16,
    fontFamily: 'Cairo-Bold',
    color: '#333',
    marginBottom: 6,
    textAlign: 'right',
  },
  newsDate: {
    fontSize: 12,
    fontFamily: 'Cairo-Regular',
    color: '#999',
    marginBottom: 8,
    textAlign: 'right',
  },
  newsDescription: {
    fontSize: 14,
    fontFamily: 'Cairo-Regular',
    color: '#666',
    lineHeight: 20,
    textAlign: 'right',
  },
  chevron: {
    marginLeft: 8,
  },
  urgentIcon: {
    marginLeft: 8,
  },
});
