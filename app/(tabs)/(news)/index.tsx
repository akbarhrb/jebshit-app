import { View, ScrollView, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import News from '../(news)/components/news';
import MosqueActivities from '../(news)/components/activities';
import ReligiousTopics from '../(news)/components/topics';
import Memories from '../(news)/components/memories';
import Jobs from '../(news)/components/jobs';


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
  const [selectedCategory, setSelectedCategory] = useState('News');

  const categories = [
    { key: 'News', label: '📰 الأخبار' },
    { key: 'Mosque', label: '🕌 الأنشطة المسجدية' },
    { key: 'Religious', label: '📚 المواضيع الدينية' },
    { key: 'Memories', label: '🕰️ ذكريات القرية' },
    { key: 'Jobs', label: '💼 الوظائف' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>اخر الأخبار</Text>
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

      {/* Render selected category */}
      <View style={{ flex: 1 }}>
        {selectedCategory === 'Memories' && <Memories />}
        {selectedCategory === 'News' && <News />}
        {selectedCategory === 'Mosque' && <MosqueActivities />}
        {selectedCategory === 'Religious' && <ReligiousTopics />}
        {selectedCategory === 'Jobs' && <Jobs />}
      </View>
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
