import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { getUnreadCountApi } from '../api/notificationApi';
import { COLORS, FONTS } from '../theme';
import { useFocusEffect } from '@react-navigation/native';

const BellIcon = ({ color = COLORS.white, size = 24 }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    {/* Bell body */}
    <View
      style={{
        position: 'absolute',
        bottom: size * 0.15,
        width: size * 0.65,
        height: size * 0.5,
        borderTopLeftRadius: size * 0.2,
        borderTopRightRadius: size * 0.2,
        borderBottomLeftRadius: size * 0.08,
        borderBottomRightRadius: size * 0.08,
        backgroundColor: color,
      }}
    />
    {/* Bell ring left */}
    <View
      style={{
        position: 'absolute',
        top: size * 0.08,
        left: size * 0.12,
        width: size * 0.15,
        height: size * 0.2,
        borderRadius: size * 0.1,
        borderWidth: 2,
        borderColor: color,
      }}
    />
    {/* Bell ring right */}
    <View
      style={{
        position: 'absolute',
        top: size * 0.08,
        right: size * 0.12,
        width: size * 0.15,
        height: size * 0.2,
        borderRadius: size * 0.1,
        borderWidth: 2,
        borderColor: color,
      }}
    />
    {/* Bell clapper */}
    <View
      style={{
        position: 'absolute',
        bottom: size * 0.08,
        width: size * 0.12,
        height: size * 0.15,
        backgroundColor: color,
        borderRadius: size * 0.06,
      }}
    />
  </View>
);

const NotificationBell = ({ navigation }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      fetchUnreadCount();
    }, [])
  );

  const fetchUnreadCount = async () => {
    try {
      setLoading(true);
      const res = await getUnreadCountApi();
      setUnreadCount(res.data.unreadCount || 0);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={() => {
        navigation.push('Notifications');
        setTimeout(fetchUnreadCount, 100);
      }}
      activeOpacity={0.7}
      style={styles.bellButton}
    >
      <BellIcon color={COLORS.white} size={24} />
      {unreadCount > 0 && (
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  bellButton: {
    position: 'relative',
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeContainer: {
    position: 'absolute',
    top: 0,
    right: 4,
    backgroundColor: '#FF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: FONTS.bold,
  },
});

export default NotificationBell;
export { BellIcon };
