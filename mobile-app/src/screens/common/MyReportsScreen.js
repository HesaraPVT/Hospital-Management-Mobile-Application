import React, { useState, useCallback, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    RefreshControl
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getPatientReportsApi } from '../../api/medicalReportApi';
import { AuthContext } from '../../context/AuthContext';
import ScreenHeader from '../../components/ScreenHeader';
import EmptyState from '../../components/EmptyState';
import { COLORS, FONTS, RADIUS, SHADOW } from '../../theme';

const MyReportsScreen = ({ navigation }) => {
    const { userInfo } = useContext(AuthContext);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchReports = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getPatientReportsApi(userInfo._id);
            setReports(res.data);
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Could not load reports');
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [userInfo._id]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            const res = await getPatientReportsApi(userInfo._id);
            setReports(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setRefreshing(false);
        }
    }, [userInfo._id]);

    useFocusEffect(
        useCallback(() => {
            fetchReports();
        }, [fetchReports])
    );

    const handleReportPress = (report) => {
        navigation.navigate('MyReportDetail', { reportId: report._id });
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getReportTypeColor = (type) => {
        const colors = {
            'X-ray': '#FFE5B4',
            'ECG': '#FFB3BA',
            'MRI': '#A8E6CF',
            'CT scan': '#FFD4E5',
            'Blood test': '#C7CEEA',
            'Ultrasound': '#FFC0CB',
            'Other': '#E0E0E0'
        };
        return colors[type] || colors['Other'];
    };

    const renderReportCard = ({ item }) => (
        <TouchableOpacity
            style={[styles.reportCard, SHADOW.sm]}
            onPress={() => handleReportPress(item)}
            activeOpacity={0.85}
        >
            <View style={styles.cardHeader}>
                <View style={styles.reportTypeContainer}>
                    <View
                        style={[
                            styles.reportTypeIcon,
                            { backgroundColor: getReportTypeColor(item.reportType) }
                        ]}
                    >
                        <Text style={styles.reportTypeIconText}>
                            {item.reportType.charAt(0)}
                        </Text>
                    </View>
                    <View style={styles.reportInfo}>
                        <Text style={styles.reportType}>{item.reportType}</Text>
                        <Text style={styles.reportDate}>
                            Scan: {formatDate(item.scanDate)}
                        </Text>
                    </View>
                </View>
                <View style={styles.viewedBadge}>
                    {!item.isViewed && (
                        <View style={styles.newBadge}>
                            <Text style={styles.newBadgeText}>NEW</Text>
                        </View>
                    )}
                </View>
            </View>

            <View style={styles.cardBody}>
                <DetailItem label="Doctor" value={item.doctorName} />
                <DetailItem label="Uploaded" value={formatDate(item.createdAt)} />
                {item.description && (
                    <Text style={styles.description} numberOfLines={2}>
                        {item.description}
                    </Text>
                )}
            </View>

            <View style={styles.cardFooter}>
                <View style={styles.fileTypeTag}>
                    <Text style={styles.fileTypeTagText}>
                        {item.fileType.toUpperCase()}
                    </Text>
                </View>
                <Text style={styles.viewMore}>View Details ›</Text>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.root}>
                <ScreenHeader title="My Reports" subtitle="Your medical reports" onBack={() => navigation.goBack()} />
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={COLORS.tealBright} />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.root}>
            <ScreenHeader
                title="My Reports"
                subtitle={`${reports.length} report${reports.length === 1 ? '' : 's'} available`}
                onBack={() => navigation.goBack()}
            />

            {/* Visible top back button for web/large screens */}
            <View style={styles.topBackWrap}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.topBackBtn} activeOpacity={0.8}>
                    <Text style={styles.topBackText}>← Back</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={reports}
                keyExtractor={(item) => item._id}
                renderItem={renderReportCard}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[COLORS.tealBright]}
                    />
                }
                ListEmptyComponent={
                    <EmptyState
                        message="No reports yet"
                        subtitle="Your medical reports will appear here once the admin uploads them"
                    />
                }
            />
        </View>
    );
};

const DetailItem = ({ label, value }) => (
    <View style={styles.detailItem}>
        <Text style={styles.detailLabel}>{label}:</Text>
        <Text style={styles.detailValue}>{value}</Text>
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
    listContent: {
        padding: 15,
        paddingBottom: 30,
    },
    reportCard: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.md,
        marginBottom: 12,
        overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: 15,
        paddingTop: 15,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
    },
    reportTypeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    reportTypeIcon: {
        width: 45,
        height: 45,
        borderRadius: RADIUS.sm,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    reportTypeIconText: {
        ...FONTS.h3_bold,
        color: COLORS.white,
    },
    reportInfo: {
        flex: 1,
    },
    reportType: {
        ...FONTS.body2_bold,
        color: COLORS.text,
        marginBottom: 2,
    },
    reportDate: {
        ...FONTS.body3,
        color: COLORS.gray,
    },
    viewedBadge: {
        marginLeft: 10,
    },
    newBadge: {
        backgroundColor: COLORS.danger,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: RADIUS.xs,
    },
    newBadgeText: {
        ...FONTS.body3_bold,
        color: COLORS.white,
        fontSize: 10,
    },
    cardBody: {
        paddingHorizontal: 15,
        paddingVertical: 12,
    },
    detailItem: {
        flexDirection: 'row',
        marginBottom: 6,
    },
    detailLabel: {
        ...FONTS.body3,
        color: COLORS.gray,
        marginRight: 5,
    },
    detailValue: {
        ...FONTS.body3_bold,
        color: COLORS.text,
        flex: 1,
    },
    description: {
        ...FONTS.body3,
        color: COLORS.gray,
        marginTop: 8,
        fontStyle: 'italic',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: COLORS.lightGray,
        backgroundColor: '#FAFAFA',
    },
    fileTypeTag: {
        backgroundColor: COLORS.tealFaint,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: RADIUS.xs,
    },
    fileTypeTagText: {
        ...FONTS.body3_bold,
        color: COLORS.tealBright,
        fontSize: 10,
    },
    viewMore: {
        ...FONTS.body3,
        color: COLORS.tealBright,
    },
    topBackWrap: {
        paddingHorizontal: 15,
        paddingTop: 8,
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

export default MyReportsScreen;
