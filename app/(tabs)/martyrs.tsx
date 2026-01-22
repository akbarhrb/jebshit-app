import { View, Text, StyleSheet, FlatList, ActivityIndicator, Image } from 'react-native';
import { useEffect, useState } from 'react';

interface Martyr {
  id: string;
  name: string;
  photo_url: string | null;
  date_of_martyrdom: string;
  biography: string;
}

// 🔹 Local mock data (replace or expand anytime)
const MOCK_MARTYRS: Martyr[] = [
  {
    id: '1',
    name: 'الشهيد أحمد محمد',
    photo_url: null,
    date_of_martyrdom: '2022-05-14',
    biography: 'أحد أبناء القرية، عُرف بأخلاقه الطيبة وشجاعته.'
  },
  {
    id: '2',
    name: 'الشهيد علي حسن',
    photo_url: null,
    date_of_martyrdom: '2021-11-03',
    biography: 'قدّم روحه فداءً للوطن، وسيبقى ذكره خالداً.'
  }
];

export default function MartyrsTab() {
  const [martyrs, setMartyrs] = useState<Martyr[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setMartyrs(
        [...MOCK_MARTYRS].sort(
          (a, b) =>
            new Date(b.date_of_martyrdom).getTime() -
            new Date(a.date_of_martyrdom).getTime()
        )
      );
      setLoading(false);
    }, 800);
  }, []);

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2c5f2d" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>الشهداء</Text>
        <Text style={styles.headerSubtitle}>رحمهم الله وأسكنهم فسيح جناته</Text>
      </View>

      <FlatList
        data={martyrs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.martyrCard}>
            <View style={styles.photoContainer}>
              {item.photo_url ? (
                <Image source={{ uri: item.photo_url }} style={styles.photo} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Text style={styles.photoPlaceholderText}>صورة</Text>
                </View>
              )}
            </View>

            <View style={styles.martyrInfo}>
              <Text style={styles.martyrName}>{item.name}</Text>
              <Text style={styles.martyrDate}>
                {formatDate(item.date_of_martyrdom)}
              </Text>
              <Text style={styles.martyrBio} numberOfLines={3}>
                {item.biography}
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#2c5f2d',
    paddingHorizontal: 20,
    paddingVertical: 24,
    paddingTop: 60,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Cairo-Bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Cairo-Regular',
    color: '#e8f5e9',
    textAlign: 'center',
  },
  listContainer: {
    padding: 16,
  },
  martyrCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderRightWidth: 4,
    borderRightColor: '#2c5f2d',
  },
  photoContainer: {
    marginLeft: 16,
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  photoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e8f5e9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2c5f2d',
  },
  photoPlaceholderText: {
    fontSize: 14,
    fontFamily: 'Cairo-Regular',
    color: '#2c5f2d',
  },
  martyrInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  martyrName: {
    fontSize: 18,
    fontFamily: 'Cairo-Bold',
    color: '#1a1a1a',
    marginBottom: 4,
    textAlign: 'right',
  },
  martyrDate: {
    fontSize: 13,
    fontFamily: 'Cairo-Regular',
    color: '#666',
    marginBottom: 8,
    textAlign: 'right',
  },
  martyrBio: {
    fontSize: 14,
    fontFamily: 'Cairo-Regular',
    color: '#555',
    lineHeight: 22,
    textAlign: 'right',
  },
});
