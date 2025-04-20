import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { getUserFoundItems, getUserLostItems } from "../services/databaseService";
import PostCard from "./PostCard";

const UserItems = ({ userId }) => {
  const [foundItems, setFoundItems] = useState([]);
  const [lostItems, setLostItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("found");

  const loadItems = async () => {
    try {
      setError(null);
      const [found, lost] = await Promise.all([
        getUserFoundItems(userId),
        getUserLostItems(userId)
      ]);
      setFoundItems(found);
      setLostItems(lost);
    } catch (error) {
      console.error("Error loading items:", error);
      if (error.message.includes("requires an index")) {
        setError("Building search index... Please try again in a few minutes.");
      } else {
        setError("Failed to load items. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, [userId]);

  const handleUpdatePost = async (postId, updatedData) => {
    try {
      await updateFoundItem(postId, updatedData);
      await loadItems();
    } catch (error) {
      console.error("Error updating post:", error);
      Alert.alert("Error", "Failed to update post. Please try again.");
    }
  };

  const renderTab = (label, onPress) => (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.tab,
        activeTab === label.toLowerCase() && styles.activeTab,
      ]}
    >
      <Text style={activeTab === label.toLowerCase() ? styles.activeTabText : styles.tabText}>{label}</Text>
    </TouchableOpacity>
  );

  const renderItems = () => {
    const items = activeTab === "found" ? foundItems : lostItems;
    if (items.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {error || `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} items not found`}
          </Text>
          {error && (
            <TouchableOpacity
              onPress={loadItems}
              style={styles.retryButton}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollView}
      >
        {items.map((item) => (
          <PostCard
            key={item.id}
            item={item}
            onUpdateStatus={handleUpdatePost}
          />
        ))}
      </ScrollView>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        {renderTab("Found", () => setActiveTab("found"))}
        {renderTab("Lost", () => setActiveTab("lost"))}
      </View>
      {renderItems()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 10,
  },
  tab: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    color: '#666',
    fontSize: 16,
  },
  activeTabText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollView: {
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default UserItems;
