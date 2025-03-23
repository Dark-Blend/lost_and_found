import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;

const ItemDetailsBox = ({ items, selectedItemId }) => {
  const router = useRouter();
  const displayItems = selectedItemId 
    ? items.filter(item => item.id === selectedItemId)
    : items;

  if (displayItems.length === 0) return null;

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        snapToInterval={CARD_WIDTH + 20}
        snapToAlignment="center"
        decelerationRate="fast"
      >
        {displayItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            onPress={() => router.push(`/post/${item.id}`)}
            activeOpacity={0.95}
          >
            <Image
              source={{ uri: `data:image/jpeg;base64,${item.images[0]}` }}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.content}>
              <Text style={styles.title} numberOfLines={1}>{item.itemName}</Text>
              <Text style={styles.description} numberOfLines={2}>
                {item.description}
              </Text>
              <View style={styles.footer}>
                <Text style={styles.date}>
                  {new Date(item.createdAt.toDate()).toLocaleDateString()}
                </Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    Available
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    paddingVertical: 10,
  },
  scrollContent: {
    paddingHorizontal: 10,
  },
  card: {
    width: CARD_WIDTH,
    marginHorizontal: 10,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  image: {
    width: '100%',
    height: 120,
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    fontFamily: 'Poppins',
    color: '#666',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
    fontFamily: 'Poppins-Light',
    color: '#666',
  },
  badge: {
    backgroundColor: '#eab308',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Poppins',
  },
});

export default ItemDetailsBox; 