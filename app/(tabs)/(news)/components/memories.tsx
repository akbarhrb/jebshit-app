import { View, Text, FlatList, Image, StyleSheet, Dimensions } from 'react-native';
import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import Video from 'react-native-video';
import { db } from '@/lib/firebase';

const { width } = Dimensions.get('window');

interface Memory {
  id: string;
  title: string;
  description: string;
  content: string;
  images: string[];
  videos: string[];
  memoryDate: string;
}

export default function Memories() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMemories = async () => {
      try {
        setLoading(true);

        const q = query(
          collection(db, 'memories'),
          orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(q);

        const data: Memory[] = snapshot.docs.map(doc => {
          const raw = doc.data() as any;

          return {
            id: doc.id,
            title: raw.title,
            description: raw.description,
            content: raw.content,
            images: raw.images || [],
            videos: raw.videos || [],
            memoryDate: raw.memoryDate?.toDate
              ? raw.memoryDate.toDate().toLocaleDateString('ar-EG')
              : '',
          };
        });

        setMemories(data);
      } catch (e) {
        console.error('Error fetching memories', e);
        setMemories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMemories();
  }, []);

  const renderItem = ({ item }: { item: Memory }) => (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.date}>{item.memoryDate}</Text>
      </View>

      {/* Images */}
      {item.images.map((img, index) => (
        <Image
          key={`img-${index}`}
          source={{ uri: img }}
          style={styles.media}
        />
      ))}

      {/* Videos */}
      {item.videos.map((vid, index) => (
        <Video
          key={`vid-${index}`}
          source={{ uri: vid }}
          style={styles.media}
          
          resizeMode="cover"
          
        />
      ))}

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.description}>{item.description}</Text>
        <Text style={styles.text}>{item.content}</Text>
      </View>
    </View>
  );

  return (
    <FlatList
      data={memories}
      keyExtractor={item => item.id}
      renderItem={renderItem}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 20 }}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  header: {
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  date: {
    fontSize: 12,
    color: '#888',
  },
  media: {
    width,
    height: width,
    backgroundColor: '#000',
  },
  content: {
    padding: 12,
  },
  description: {
    fontWeight: '600',
    marginBottom: 4,
  },
  text: {
    color: '#333',
    lineHeight: 20,
  },
});
