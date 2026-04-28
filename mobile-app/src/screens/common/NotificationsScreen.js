import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getNotificationsApi, markNotificationAsReadApi, deleteNotificationApi, markAllAsReadApi } from '../../api/notificationApi';
import { getAppointmentByIdApi } from '../../api/appointmentApi';
import { getDoctorsApi } from '../../api/doctorApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import ScreenHeader from '../../components/ScreenHeader';
import { COLORS, FONTS, RADIUS, SHADOW } from '../../theme';

const NotificationsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getNotificationsApi(50, 0, false);
      setNotifications(res.data.notifications || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      Alert.alert('Error', 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [fetchNotifications])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  }, [fetchNotifications]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsReadApi(notificationId);
      setNotifications(notifications.map(n =>
        n._id === notificationId ? { ...n, isRead: true } : n
      ));
    } catch (error) {
      Alert.alert('Error', 'Failed to mark as read');
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await deleteNotificationApi(notificationId);
      setNotifications(notifications.filter(n => n._id !== notificationId));
    } catch (error) {
      Alert.alert('Error', 'Failed to delete notification');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadApi();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      Alert.alert('Error', 'Failed to mark all as read');
    }
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read
    if (!notification.isRead) {
      await handleMarkAsRead(notification._id);
    }

    // Handle different notification types
    if (notification.type === 'slot_available') {
      // Redirect to appointment booking with the available slot
      const { doctorId, appointmentDate, slotTime } = notification.relatedData;
      
      try {
        // Fetch doctor details
        const { data: doctors } = await getDoctorsApi();
        const doctor = doctors.find(d => d._id === doctorId);
        
        if (doctor) {
          navigation.navigate('AppointmentBooking', {
            doctor,
            preSelectDate: appointmentDate,
            preSelectTime: slotTime,
          });
        } else {
          Alert.alert('Error', 'Doctor information not found');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to navigate to booking');
      }
    } else if (notification.relatedData?.appointmentId) {
      // For other notification types with appointment info
      try {
        const { data: appointment } = await getAppointmentByIdApi(notification.relatedData.appointmentId);
        navigation.navigate('AppointmentDetails', { appointment });
      } catch (error) {
        Alert.alert('Error', 'Appointment not found');
      }
    }
  };

  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.notificationItem, !item.isRead && styles.notificationItemUnread]}
      onPress={() => handleNotificationClick(item)}
      activeOpacity={0.7}
    >
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={[styles.notificationTitle, !item.isRead && styles.notificationTitleUnread]}>
            {item.title}
          </Text>
          {!item.isRead && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.notificationMessage}>{item.message}</Text>
        <Text style={styles.notificationTime}>
          {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>

      <TouchableOpacity
        onPress={() => handleDelete(item._id)}
        style={styles.deleteBtn}
      >
        <Text style={styles.deleteBtnText}>✕</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) return <LoadingSpinner message="Loading notifications..." />;

  return (
    <View style={styles.root}>
      <ScreenHeader
        title="Notifications"
        subtitle="Stay updated"
        onBack={() => navigation.goBack()}
        rightIcon="check-all"
        onRightPress={handleMarkAllAsRead}
      />

      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No notifications yet</Text>
          <Text style={styles.emptySubText}>You'll see updates about your appointments here</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bgPage },
  listContent: { padding: 16, paddingTop: 12, paddingBottom: 20 },

  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.tealPale,
    ...SHADOW.card,
  },
  notificationItemUnread: {
    backgroundColor: COLORS.tealFaint,
    borderLeftColor: COLORS.tealStrong,
  },
  notificationContent: { flex: 1, marginRight: 12 },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: FONTS.semibold,
    color: COLORS.navyDeep,
    flex: 1,
  },
  notificationTitleUnread: {
    fontWeight: FONTS.bold,
    color: COLORS.tealStrong,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.tealStrong,
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 6,
  },
  notificationTime: {
    fontSize: 11,
    color: COLORS.textMuted,
  },

  deleteBtn: {
    padding: 8,
    paddingTop: 0,
  },
  deleteBtnText: {
    fontSize: 16,
    color: COLORS.textMuted,
    fontWeight: FONTS.semibold,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: FONTS.semibold,
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});

export default NotificationsScreen;
