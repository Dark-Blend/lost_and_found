import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { format } from 'date-fns';

const ItemCard = ({ item, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {item.images && item.images.length > 0 && (
        <Image
          source={{ uri: `data:image/jpeg;base64,${item.images[0]}` }}
          style={styles.image}
          resizeMode="cover"
        />
      )}
      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.footer}>
          <Text style={styles.date}>
            {format(item.createdAt.toDate(), 'MMM d, yyyy')}
          </Text>
          {item.location && (
            <Text style={styles.location}>📍 Location available</Text>
          )}
        </View>
        <View style={styles.categories}>
          {item.categories.slice(0, 3).map((category, index) => (
            <View key={index} style={styles.category}>
              <Text style={styles.categoryText}>{category}</Text>
            </View>
          ))}
          {item.categories.length > 3 && (
            <Text style={styles.moreCategories}>+{item.categories.length - 3}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 150,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  location: {
    fontSize: 12,
    color: '#007AFF',
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  category: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
  },
  moreCategories: {
    fontSize: 12,
    color: '#999',
    alignSelf: 'center',
  },
});

export default ItemCard;
