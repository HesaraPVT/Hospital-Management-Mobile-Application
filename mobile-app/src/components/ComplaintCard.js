import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { COLORS, FONTS, RADIUS, SHADOW, statusColor } from '../theme';
import { rateComplaintApi } from '../api/complaintApi';

const ComplaintCard = ({ complaint, isAdmin, onRefresh }) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const sc = statusColor(complaint.status);

  const handleRate = async () => {
    if (rating === 0) {
      Alert.alert('Selection Required', 'Please select a star rating first.');
      return;
    }
    setIsSubmitting(true);
    try {
      await rateComplaintApi(complaint._id, { rating, userFeedback: feedback });
      Alert.alert('Success', 'Thank you for your feedback!');
      if (onRefresh) onRefresh();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Could not submit rating');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.complaintId}>{complaint.complaintId || 'N/A'}</Text>
          <Text style={styles.dateText}>
            {new Date(complaint.createdAt).toLocaleDateString()} at {new Date(complaint.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
          <Text style={styles.subject}>{complaint.title}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: sc.bg }]}>
          <Text style={[styles.badgeText, { color: sc.text }]}>
            {complaint.status.replace('_', ' ')}
          </Text>
        </View>
      </View>
      
      <View style={styles.metaRow}>
        <Text style={styles.metaText}>Category: {complaint.category}</Text>
        <Text style={styles.metaText}>Priority: {complaint.priority}</Text>
      </View>

      {isAdmin && complaint.contactDetails && (
        <View style={styles.userInfoBox}>
          <Text style={styles.userInfoLabel}>PROVIDED CONTACT INFO</Text>
          <Text style={styles.userInfoText}>
            Contact: <Text style={styles.userInfoValue}>{complaint.contactDetails}</Text>
          </Text>
        </View>
      )}
      
      <Text style={styles.message} numberOfLines={3}>{complaint.description}</Text>
      
      {complaint.adminReply ? (
        <View style={styles.replyBox}>
          <Text style={styles.replyLabel}>Admin reply</Text>
          <Text style={styles.replyText}>{complaint.adminReply}</Text>
        </View>
      ) : null}

      {isAdmin && complaint.internalNotes ? (
        <View style={[styles.replyBox, styles.internalNotesBox]}>
          <Text style={[styles.replyLabel, styles.internalNotesLabel]}>Internal Notes</Text>
          <Text style={styles.replyText}>{complaint.internalNotes}</Text>
        </View>
      ) : null}

      {/* Rating Section */}
      {(complaint.status === 'resolved' || complaint.status === 'closed') && (
        <View style={styles.ratingSection}>
          <View style={styles.divider} />
          {complaint.rating ? (
            <View>
              <Text style={styles.ratingTitle}>Patient Feedback</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Text key={star} style={[styles.starIcon, { color: star <= complaint.rating ? COLORS.warning : COLORS.bgOverlay }]}>★</Text>
                ))}
              </View>
              {complaint.userFeedback && (
                <Text style={styles.ratingFeedback}>"{complaint.userFeedback}"</Text>
              )}
            </View>
          ) : !isAdmin ? (
            <View>
              <Text style={styles.ratingTitle}>Rate our resolution</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => setRating(star)}>
                    <Text style={[styles.starIcon, { color: star <= rating ? COLORS.warning : COLORS.bgOverlay }]}>★</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                style={styles.ratingInput}
                placeholder="Share your feedback (optional)..."
                value={feedback}
                onChangeText={setFeedback}
                multiline
              />
              <TouchableOpacity 
                style={styles.submitRatingBtn} 
                onPress={handleRate}
                disabled={isSubmitting}
              >
                {isSubmitting ? <ActivityIndicator color={COLORS.white} size="small" /> : <Text style={styles.submitRatingText}>Submit Feedback</Text>}
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    ...SHADOW.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  complaintId: {
    fontSize: 11,
    color: COLORS.tealStrong,
    fontWeight: FONTS.bold,
    marginBottom: 2,
  },
  dateText: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  subject: {
    fontSize: 15,
    fontWeight: FONTS.bold,
    color: COLORS.navyDeep,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    paddingBottom: 6,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: FONTS.semiBold,
    textTransform: 'capitalize',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: FONTS.bold,
    textTransform: 'capitalize',
  },
  message: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 19,
  },
  replyBox: {
    marginTop: 12,
    padding: 10,
    backgroundColor: COLORS.tealFaint,
    borderRadius: RADIUS.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.tealBright,
  },
  internalNotesBox: {
    backgroundColor: COLORS.bgOverlay,
    borderLeftColor: COLORS.warning,
  },
  replyLabel: {
    fontSize: 10,
    fontWeight: FONTS.bold,
    color: COLORS.tealStrong,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  internalNotesLabel: {
    color: COLORS.warning,
  },
  replyText: {
    fontSize: 13,
    color: COLORS.navyDeep,
    lineHeight: 18,
  },
  userInfoBox: {
    backgroundColor: COLORS.bgMuted,
    borderRadius: RADIUS.md,
    padding: 10,
    marginBottom: 10,
  },
  userInfoLabel: {
    fontSize: 9,
    fontWeight: FONTS.bold,
    color: COLORS.textSecondary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  userInfoText: {
    fontSize: 12,
    color: COLORS.navyDeep,
    marginBottom: 2,
  },
  userInfoValue: {
    fontWeight: FONTS.semiBold,
    color: COLORS.tealStrong,
  },
  ratingSection: {
    marginTop: 12,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginBottom: 12,
  },
  ratingTitle: {
    fontSize: 11,
    fontWeight: FONTS.bold,
    color: COLORS.tealStrong,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  starsRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  starIcon: {
    fontSize: 24,
    marginRight: 6,
  },
  ratingFeedback: {
    fontSize: 12,
    fontStyle: 'italic',
    color: COLORS.textSecondary,
    backgroundColor: COLORS.bgOverlay,
    padding: 8,
    borderRadius: RADIUS.md,
  },
  ratingInput: {
    backgroundColor: COLORS.bgOverlay,
    borderRadius: RADIUS.md,
    padding: 10,
    fontSize: 13,
    color: COLORS.navyDeep,
    height: 60,
    textAlignVertical: 'top',
    marginBottom: 10,
  },
  submitRatingBtn: {
    backgroundColor: COLORS.tealBright,
    borderRadius: RADIUS.md,
    paddingVertical: 10,
    alignItems: 'center',
  },
  submitRatingText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: FONTS.bold,
  },
});

export default ComplaintCard;