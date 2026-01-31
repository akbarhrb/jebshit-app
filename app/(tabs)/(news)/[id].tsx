import { View, ScrollView, Text, StyleSheet, Pressable, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SafeAreaView } from 'react-native-safe-area-context';
import Video from 'react-native-video';


interface NewsItem {
  id: string;
  title: string;
  date: string;
  content: string;
  media?: Array<{ type: 'image' | 'video'; url: string }>; 
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
          media: data.mediaUrls || [],
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
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.errorText}>جاري تحميل الخبر...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!newsItem) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.errorText}>الخبر غير موجود</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          style={styles.backButton}
        >
          <ArrowRight size={24} color="#333" />
        </Pressable>
        <Text style={styles.headerTitle}>تفاصيل الخبر</Text>
      </View>

      {/* CONTENT */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" >
        <View style={styles.newsCard}>
          <Text style={styles.newsTitle}>{newsItem.title}</Text>
          <Text style={styles.newsDate}>{newsItem.date}</Text>
          <View style={styles.divider} />

          {/* Media Section */}
          {newsItem.media?.map((m, i) => {
            if (m.type === 'image') {
              return (
                <Image
                  key={i}
                  source={{ uri: m.url }}
                  style={styles.newsImage}
                  resizeMode="cover"
                />
              );
            } else if (m.type === 'video') {
              return (
                <Video
                  key={i}
                  source={{ uri: m.url }}
                  style={styles.newsVideo}
                  
                  resizeMode="contain"
                />
              );
            }
          })}

          <Text style={styles.newsContent}>{newsItem.content}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f5',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12, // make header taller
    backgroundColor: '#fff',
    zIndex: 10,           // ensure header is on top
  },

  backButton: {
    padding: 12,           // larger touch area
    marginRight: 12,       // for RTL
  },
  headerTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 18,
    fontFamily: 'Cairo-Bold',
    color: '#222',
  },

  /* ---------- CONTENT ---------- */
  content: {
    flex: 1,
    margin: 16,
    textAlign: 'center',
  },

  newsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 22,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2, // Android shadow
  },

  /* ---------- TEXT ---------- */
  newsTitle: {
    fontSize: 22,
    fontFamily: 'Cairo-Bold',
    color: '#1f2937', // deep readable dark
    marginBottom: 10,
    textAlign: 'center',
    lineHeight: 32,
  },

  newsDate: {
    fontSize: 20,
    fontFamily: 'Cairo-Regular',
    color: '#8a8a8a',
    textAlign: 'center',
    marginBottom: 14,
  },

  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 18,
  },

  newsContent: {
    fontSize: 16,
    fontFamily: 'Cairo-Regular',
    color: '#374151',
    lineHeight: 28, // VERY important for Arabic
    textAlign: 'center',
  },
  newsImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },

  newsVideo: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    marginBottom: 16,
  },

  /* ---------- ERROR / EMPTY ---------- */
  errorText: {
    fontSize: 16,
    fontFamily: 'Cairo-Regular',
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 24,
  },
});

