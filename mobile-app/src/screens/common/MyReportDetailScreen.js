import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Share,
    Linking
} from 'react-native';
import { getMedicalReportByIdApi } from '../../api/medicalReportApi';
import ScreenHeader from '../../components/ScreenHeader';
import { COLORS, FONTS, RADIUS, SHADOW } from '../../theme';

const MyReportDetailScreen = ({ route, navigation }) => {
    const { reportId } = route.params;
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const res = await getMedicalReportByIdApi(reportId);
                setReport(res.data);
            } catch (error) {
                Alert.alert('Error', error.response?.data?.message || 'Could not load report');
                navigation.goBack();
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, [reportId, navigation]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleDownload = () => {
        Alert.alert(
            'Download Report',
            'This feature would download the report file to your device.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Download',
                    onPress: () => {
                        // In production, this would download the file
                        // Linking.openURL(report.reportFile);
                        Alert.alert('Download', 'Report file download initiated');
                    }
                }
            ]
        );
    };

    const handlePreview = () => {
        Alert.alert(
            'Preview Report',
            'This feature would open the report in a document viewer.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Open',
                    onPress: () => {
                        // In production, this would open the file
                        // Linking.openURL(report.reportFile);
                        Alert.alert('Preview', 'Opening report file...');
                    }
                }
            ]
        );
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Medical Report: ${report.reportType}\n\nScan Date: ${formatDate(report.scanDate)}\nDoctor: ${report.doctorName}`,
                title: `${report.reportType} Report`,
            });
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) {
        return (
            <View style={styles.root}>
                <ScreenHeader title="Medical Report" onBack={() => navigation.goBack()} />
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={COLORS.tealBright} />
                </View>
            </View>
        );
    }

    if (!report) {
        return (
            <View style={styles.root}>
                <ScreenHeader title="Medical Report" onBack={() => navigation.goBack()} />
                <View style={styles.centerContainer}>
                    <Text style={styles.errorText}>Report not found</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.root}>
            <ScreenHeader
                title="Medical Report"
                subtitle={report.reportType}
                onBack={() => navigation.goBack()}
            />

            {/* Visible top back button for web/large screens */}
            <View style={styles.topBackWrap}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.topBackBtn} activeOpacity={0.8}>
                    <Text style={styles.topBackText}>← Back to Reports</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                {/* Report Header Card */}
                <View style={[styles.headerCard, SHADOW.md]}>
                    <View style={styles.headerTop}>
                        <Text style={styles.reportTypeTitle}>{report.reportType}</Text>
                        <View style={styles.statusBadge}>
                            <Text style={styles.statusBadgeText}>✓ Available</Text>
                        </View>
                    </View>
                    <View style={styles.headerDivider} />
                    <View style={styles.headerBottom}>
                        <Text style={styles.scanDateLabel}>Scan Date</Text>
                        <Text style={styles.scanDate}>{formatDate(report.scanDate)}</Text>
                    </View>
                </View>

                {/* Report Details Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Report Details</Text>
                    <View style={[styles.detailsCard, SHADOW.sm]}>
                        <DetailRow
                            icon="👨‍⚕️"
                            label="Attending Doctor"
                            value={report.doctorName}
                        />
                        <Divider />
                        <DetailRow
                            icon="📁"
                            label="File Type"
                            value={report.fileType.toUpperCase()}
                        />
                        <Divider />
                        <DetailRow
                            icon="📤"
                            label="Uploaded Date"
                            value={`${formatDate(report.createdAt)} at ${formatTime(report.createdAt)}`}
                        />
                        {report.uploadedBy && (
                            <>
                                <Divider />
                                <DetailRow
                                    icon="👤"
                                    label="Uploaded By"
                                    value={report.uploadedBy.name || 'Administrator'}
                                />
                            </>
                        )}
                    </View>
                </View>

                {/* Description Section */}
                {report.description && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Notes & Description</Text>
                        <View style={[styles.descriptionBox, SHADOW.sm]}>
                            <Text style={styles.description}>{report.description}</Text>
                        </View>
                    </View>
                )}

                {/* File Preview Placeholder */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Report File</Text>
                    <View style={[styles.filePreviewBox, SHADOW.sm]}>
                        <Text style={styles.filePreviewIcon}>📄</Text>
                        <Text style={styles.filePreviewText}>
                            {report.reportFile || 'Report file'}
                        </Text>
                        <Text style={styles.filePreviewSubtext}>
                            {report.fileType === 'pdf' ? 'PDF Document' : 'Image File'}
                        </Text>
                    </View>
                </View>

                {/* Info Box */}
                <View style={styles.infoBox}>
                    <Text style={styles.infoText}>
                        This report has been securely uploaded and is only accessible to you and your healthcare provider.
                    </Text>
                </View>
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.backActionButton, SHADOW.sm]}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.85}
                >
                    <Text style={styles.actionButtonIcon}>←</Text>
                    <Text style={styles.actionButtonText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, SHADOW.sm]}
                    onPress={handlePreview}
                    activeOpacity={0.85}
                >
                    <Text style={styles.actionButtonIcon}>👁️</Text>
                    <Text style={styles.actionButtonText}>Preview</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, SHADOW.sm]}
                    onPress={handleDownload}
                    activeOpacity={0.85}
                >
                    <Text style={styles.actionButtonIcon}>⬇️</Text>
                    <Text style={styles.actionButtonText}>Download</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, SHADOW.sm]}
                    onPress={handleShare}
                    activeOpacity={0.85}
                >
                    <Text style={styles.actionButtonIcon}>📤</Text>
                    <Text style={styles.actionButtonText}>Share</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const DetailRow = ({ icon, label, value }) => (
    <View style={styles.detailRow}>
        <Text style={styles.detailIcon}>{icon}</Text>
        <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>{label}</Text>
            <Text style={styles.detailValue}>{value}</Text>
        </View>
    </View>
);

const Divider = () => <View style={styles.divider} />;

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
    errorText: {
        ...FONTS.body2,
        color: COLORS.danger,
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 15,
        paddingBottom: 100,
    },
    headerCard: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.lg,
        padding: 20,
        marginBottom: 20,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    reportTypeTitle: {
        ...FONTS.h2,
        color: COLORS.text,
        flex: 1,
    },
    statusBadge: {
        backgroundColor: COLORS.success,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: RADIUS.sm,
    },
    statusBadgeText: {
        ...FONTS.body3_bold,
        color: COLORS.white,
    },
    headerDivider: {
        height: 1,
        backgroundColor: COLORS.lightGray,
        marginBottom: 15,
    },
    headerBottom: {
        alignItems: 'center',
    },
    scanDateLabel: {
        ...FONTS.body3,
        color: COLORS.gray,
        marginBottom: 4,
    },
    scanDate: {
        ...FONTS.body2_bold,
        color: COLORS.tealBright,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        ...FONTS.body2_bold,
        color: COLORS.text,
        marginBottom: 10,
    },
    detailsCard: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.md,
        overflow: 'hidden',
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 15,
    },
    detailIcon: {
        fontSize: 20,
        marginRight: 12,
        marginTop: 2,
    },
    detailContent: {
        flex: 1,
    },
    detailLabel: {
        ...FONTS.body3,
        color: COLORS.gray,
        marginBottom: 4,
    },
    detailValue: {
        ...FONTS.body2_bold,
        color: COLORS.text,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.lightGray,
    },
    descriptionBox: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.md,
        padding: 15,
    },
    description: {
        ...FONTS.body3,
        color: COLORS.text,
        lineHeight: 20,
    },
    filePreviewBox: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.md,
        padding: 20,
        alignItems: 'center',
    },
    filePreviewIcon: {
        fontSize: 40,
        marginBottom: 10,
    },
    filePreviewText: {
        ...FONTS.body2_bold,
        color: COLORS.text,
        marginBottom: 4,
        textAlign: 'center',
    },
    filePreviewSubtext: {
        ...FONTS.body3,
        color: COLORS.gray,
    },
    infoBox: {
        backgroundColor: '#E3F2FD',
        borderRadius: RADIUS.md,
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.tealBright,
    },
    infoText: {
        ...FONTS.body3,
        color: '#01579B',
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 10,
        padding: 15,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: COLORS.lightGray,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    backActionButton: {
        width: 92,
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.md,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.lightGray,
        marginRight: 8,
    },
    actionButton: {
        flex: 1,
        backgroundColor: COLORS.tealFaint,
        borderRadius: RADIUS.md,
        paddingVertical: 12,
        alignItems: 'center',
    },
    actionButtonIcon: {
        fontSize: 18,
        marginBottom: 4,
    },
    actionButtonText: {
        ...FONTS.body3_bold,
        color: COLORS.tealBright,
    },
    topBackWrap: {
        paddingHorizontal: 15,
        paddingTop: 12,
        paddingBottom: 6,
        backgroundColor: 'transparent',
    },
    topBackBtn: {
        alignSelf: 'flex-start',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 8,
        backgroundColor: 'rgba(0,0,0,0.04)',
    },
    topBackText: {
        color: COLORS.textMuted,
        fontWeight: '600',
    },
});

export default MyReportDetailScreen;
