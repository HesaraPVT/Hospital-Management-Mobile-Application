import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    Image,
    ActivityIndicator
} from 'react-native';
import { getPatientDetailsApi } from '../../api/medicalReportApi';
import ScreenHeader from '../../components/ScreenHeader';
import { COLORS, FONTS, RADIUS, SHADOW } from '../../theme';

const PatientConfirmationScreen = ({ route, navigation }) => {
    const { patient } = route.params;
    const [loading, setLoading] = useState(true);
    const [patientDetails, setPatientDetails] = useState(patient);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await getPatientDetailsApi(patient._id);
                setPatientDetails(res.data);
            } catch (error) {
                Alert.alert('Error', error.response?.data?.message || 'Could not fetch patient details');
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [patient._id]);

    const handleConfirm = () => {
        navigation.navigate('ReportUpload', { patient: patientDetails });
    };

    const handleCancel = () => {
        navigation.goBack();
    };

    if (loading) {
        return (
            <View style={styles.root}>
                <ScreenHeader title="Confirm Patient" onBack={() => navigation.goBack()} />
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={COLORS.tealBright} />
                </View>
            </View>
        );
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'Not specified';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <View style={styles.root}>
            <ScreenHeader
                title="Confirm Patient"
                subtitle="Verify this is the correct patient"
                onBack={() => navigation.goBack()}
            />

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                {/* Alert Box */}
                <View style={[styles.alertBox, SHADOW.sm]}>
                    <View style={styles.alertIcon}>
                        <Text style={styles.alertIconText}>⚠️</Text>
                    </View>
                    <View style={styles.alertContent}>
                        <Text style={styles.alertTitle}>Verify Patient Identity</Text>
                        <Text style={styles.alertMessage}>
                            Please carefully review the patient details below. Reports will be linked to this patient profile.
                        </Text>
                    </View>
                </View>

                {/* Patient Profile Card */}
                <View style={[styles.profileCard, SHADOW.md]}>
                    <View style={styles.profileHeader}>
                        {patientDetails.profileImage ? (
                            <Image
                                source={{ uri: patientDetails.profileImage }}
                                style={styles.profileImage}
                            />
                        ) : (
                            <View style={[styles.profileImage, { backgroundColor: COLORS.tealBright }]}>
                                <Text style={styles.profileImageText}>
                                    {patientDetails.name.charAt(0).toUpperCase()}
                                </Text>
                            </View>
                        )}
                        <View style={styles.verifiedBadge}>
                            <Text style={styles.verifiedText}>✓</Text>
                        </View>
                    </View>

                    {/* Patient Details */}
                    <View style={styles.detailsSection}>
                        <DetailRow label="Full Name" value={patientDetails.name} />
                        <DetailRow label="Patient ID" value={patientDetails.patientID} highlight />
                        <DetailRow label="Email" value={patientDetails.email} />
                        <DetailRow label="Phone" value={patientDetails.phone || 'Not provided'} />
                        {patientDetails.dateOfBirth && (
                            <DetailRow
                                label="Date of Birth"
                                value={formatDate(patientDetails.dateOfBirth)}
                            />
                        )}
                        {patientDetails.nic && (
                            <DetailRow label="NIC" value={patientDetails.nic} />
                        )}
                        {patientDetails.address && (
                            <DetailRow label="Address" value={patientDetails.address} />
                        )}
                    </View>
                </View>

                {/* Confirmation Message */}
                <View style={styles.confirmationBox}>
                    <Text style={styles.confirmationText}>
                        I confirm that this is the correct patient and I want to proceed with uploading the medical report.
                    </Text>
                </View>
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={handleCancel}
                    activeOpacity={0.85}
                >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, styles.confirmButton]}
                    onPress={handleConfirm}
                    activeOpacity={0.85}
                >
                    <Text style={styles.confirmButtonText}>Confirm & Continue</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const DetailRow = ({ label, value, highlight }) => (
    <View style={[styles.detailRow, highlight && styles.detailRowHighlight]}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={[styles.detailValue, highlight && styles.detailValueHighlight]}>
            {value}
        </Text>
    </View>
);

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 15,
        paddingBottom: 20,
    },
    alertBox: {
        backgroundColor: '#FFF3CD',
        borderRadius: RADIUS.md,
        padding: 15,
        marginBottom: 20,
        flexDirection: 'row',
        gap: 12,
    },
    alertIcon: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    alertIconText: {
        fontSize: 24,
    },
    alertContent: {
        flex: 1,
        justifyContent: 'center',
    },
    alertTitle: {
        ...FONTS.body2_bold,
        color: '#856404',
        marginBottom: 4,
    },
    alertMessage: {
        ...FONTS.body3,
        color: '#856404',
    },
    profileCard: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.lg,
        padding: 20,
        marginBottom: 20,
    },
    profileHeader: {
        alignItems: 'center',
        marginBottom: 20,
        position: 'relative',
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileImageText: {
        ...FONTS.h2,
        color: COLORS.white,
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.success,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: COLORS.white,
    },
    verifiedText: {
        fontSize: 20,
        color: COLORS.white,
    },
    detailsSection: {
        gap: 0,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
    },
    detailRowHighlight: {
        backgroundColor: '#E0F7F4',
        paddingHorizontal: 10,
        marginHorizontal: -10,
        paddingVertical: 12,
    },
    detailLabel: {
        ...FONTS.body3,
        color: COLORS.gray,
        flex: 1,
    },
    detailValue: {
        ...FONTS.body3_bold,
        color: COLORS.text,
        textAlign: 'right',
        flex: 1,
    },
    detailValueHighlight: {
        color: COLORS.tealBright,
    },
    confirmationBox: {
        backgroundColor: '#E8F5E9',
        borderRadius: RADIUS.md,
        padding: 15,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.success,
    },
    confirmationText: {
        ...FONTS.body3,
        color: '#2E7D32',
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
        padding: 15,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: COLORS.lightGray,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: RADIUS.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: COLORS.lightGray,
    },
    cancelButtonText: {
        ...FONTS.body2_bold,
        color: COLORS.text,
    },
    confirmButton: {
        backgroundColor: COLORS.tealBright,
    },
    confirmButtonText: {
        ...FONTS.body2_bold,
        color: COLORS.white,
    },
});

export default PatientConfirmationScreen;
