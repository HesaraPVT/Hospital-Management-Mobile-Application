/*import React, { useState, useCallback, useContext } from 'react';
import { View, FlatList, StyleSheet, Alert, TouchableOpacity, Text } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getServicesApi } from '../../api/serviceApi';
import ServiceCard from '../../components/ServiceCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import ScreenHeader from '../../components/ScreenHeader';
import { AuthContext } from '../../context/AuthContext';
import { COLORS, FONTS, RADIUS } from '../../theme';

const ServiceListScreen = ({ navigation }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userInfo } = useContext(AuthContext);
  const isAdmin = userInfo?.role === 'admin';

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getServicesApi();
      setServices(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchServices();
    }, [fetchServices])
  );

  if (loading) return <LoadingSpinner message="Loading services..." />;

  return (
    <View style={styles.root}>
      <ScreenHeader
        title="Our Services"
        subtitle={`${services.length} services available`}
        rightAction={
          isAdmin ? (
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => navigation.navigate('ServiceForm')}
              activeOpacity={0.8}
            >
              <Text style={styles.addBtnText}>+ Add</Text>
            </TouchableOpacity>
          ) : null
        }
      />
      <FlatList
        data={services}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyState message="No services available" />}
        renderItem={({ item }) => (
          <ServiceCard
            service={item}
            onPress={() => {
              if (isAdmin) {
                navigation.navigate('ServiceForm', { service: item });
              } else {
                Alert.alert(item.serviceName, `${item.description}\n\nPrice: $${item.price}\nDuration: ${item.duration} min`);
              }
            }}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bgPage },
  list: { paddingTop: 12, paddingBottom: 30 },
  addBtn: {
    backgroundColor: COLORS.tealBright,
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: RADIUS.full,
  },
  addBtnText: { color: COLORS.white, fontSize: 13, fontWeight: FONTS.bold },
});

export default ServiceListScreen;*/





/*import React, { useState, useEffect, useContext, useCallback } from 'react';
import { View, FlatList, StyleSheet, Alert, Pressable, Text, RefreshControl } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { getServicesApi } from '../../api/serviceApi';
import ServiceCard from '../../components/ServiceCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import ScreenHeader from '../../components/ScreenHeader';
import { AuthContext } from '../../context/AuthContext';
import { COLORS, FONTS, RADIUS } from '../../theme';

const ServiceListScreen = ({ navigation }) => {
    // State management for hospital data
    const [hospitalServices, setHospitalServices] = useState([]);
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    const { userInfo } = useContext(AuthContext);
    const isFocused = useIsFocused();
    
    // Authorization check for Admin privileges
    const canManageServices = userInfo?.role === 'admin';

    /**
     * loadHospitalData
     * Communicates with the backend to fetch the latest service catalog.
     * Uses optional chaining to safely navigate the JSON response.
     *//*
    const loadHospitalData = async () => {
        try {
            const response = await getServicesApi();
            
            // Map the data correctly from the backend object structure
            const fetchedData = response.data?.data || [];
            
            setHospitalServices(fetchedData);
        } catch (err) {
            console.error('API Fetch Error:', err);
            Alert.alert(
                'Data Sync Failed', 
                'We couldn\'t refresh the medical services catalog. Please try again.'
            );
            setHospitalServices([]); 
        } finally {
            setIsPageLoading(false);
            setRefreshing(false);
        }
    };

    // Callback for the pull-to-refresh action
    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        loadHospitalData();
    }, []);

    // Effect to auto-refresh whenever the screen is viewed
    useEffect(() => {
        if (isFocused) {
            loadHospitalData();
        }
    }, [isFocused]);

    /**
     * handleServiceSelection
     * Directs the user based on their role:
     * - Admins go to the editor.
     * - Patients see a detailed breakdown in LKR.
     *//*
    const handleServiceSelection = (item) => {
        if (canManageServices) {
            navigation.navigate('ServiceForm', { service: item });
        } else {
            Alert.alert(
                item.serviceName,
                `${item.description}\n\nStandard Fee: LKR ${item.price}\nExpected Duration: ${item.duration} mins`,
                [{ text: "Back", style: "cancel" }]
            );
        }
    };

    // Global loading state (only shown on initial load)
    if (isPageLoading && !refreshing) {
        return <LoadingSpinner message="Accessing Medical Records..." />;
    }

    return (
        <View style={styles.mainContainer}>
            <ScreenHeader
                title="Medical Services"
                subtitle={`${hospitalServices.length} Departments Online`}
                rightAction={
                    canManageServices && (
                        <Pressable
                            style={({ pressed }) => [
                                styles.addButton,
                                { backgroundColor: pressed ? COLORS.tealPale : COLORS.tealBright }
                            ]}
                            onPress={() => navigation.navigate('ServiceForm')}
                        >
                            <Text style={styles.addButtonText}>+ New</Text>
                        </Pressable>
                    )
                }
            />

            <FlatList
                data={hospitalServices}
                keyExtractor={(item) => item._id?.toString() || Math.random().toString()}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl 
                        refreshing={refreshing} 
                        onRefresh={handleRefresh} 
                        colors={[COLORS.tealBright]} 
                        tintColor={COLORS.tealBright} // Support for iOS
                    />
                }
                ListEmptyComponent={
                    <EmptyState 
                        message="No medical services are currently listed." 
                        onRetry={loadHospitalData} 
                    />
                }
                renderItem={({ item }) => (
                    <ServiceCard
                        service={item}
                        onPress={() => handleServiceSelection(item)}
                    />
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: { 
        flex: 1, 
        backgroundColor: COLORS.bgPage 
    },
    scrollContent: { 
        paddingHorizontal: 16,
        paddingTop: 10, 
        paddingBottom: 50 
    },
    addButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: RADIUS.md,
    },
    addButtonText: { 
        color: COLORS.white, 
        fontSize: 12, 
        fontWeight: '800',
        textTransform: 'uppercase'
    },
});

export default ServiceListScreen;*/





import React, { useState, useEffect, useContext, useCallback } from 'react';
import { View, FlatList, StyleSheet, Alert, Pressable, Text, RefreshControl, TouchableOpacity } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { getServicesApi } from '../../api/serviceApi';
import ServiceCard from '../../components/ServiceCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import ScreenHeader from '../../components/ScreenHeader';
import { AuthContext } from '../../context/AuthContext';
import { COLORS, FONTS, RADIUS } from '../../theme';

// Define the categories (Must match your Backend enum)
const CATEGORIES = ['All', 'Laboratory', 'Radiology', 'Consultation', 'General', 'Emergency'];

const ServiceListScreen = ({ navigation }) => {
    const [hospitalServices, setHospitalServices] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All'); // Added state for filtering
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    const { userInfo } = useContext(AuthContext);
    const isFocused = useIsFocused();
    const canManageServices = userInfo?.role === 'admin';

    const loadHospitalData = async () => {
        try {
            const response = await getServicesApi();
            const fetchedData = response.data?.data || [];
            setHospitalServices(fetchedData);
        } catch (err) {
            console.error('API Fetch Error:', err);
            Alert.alert('Data Sync Failed', 'We couldn\'t refresh the catalog.');
            setHospitalServices([]); 
        } finally {
            setIsPageLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        loadHospitalData();
    }, []);

    useEffect(() => {
        if (isFocused) {
            loadHospitalData();
        }
    }, [isFocused]);

    /**
     * FILTER LOGIC
     * This derived state calculates which services to show based on the selected chip.
     */
    const filteredServices = selectedCategory === 'All' 
        ? hospitalServices 
        : hospitalServices.filter(s => s.category === selectedCategory);

    const handleServiceSelection = (item) => {
        if (canManageServices) {
            navigation.navigate('ServiceForm', { service: item });
        } else {
            Alert.alert(
                item.serviceName,
                `${item.description}\n\nDept: ${item.category}\nStandard Fee: LKR ${item.price}\nExpected Duration: ${item.duration} mins`,
                [{ text: "Back", style: "cancel" }]
            );
        }
    };

    if (isPageLoading && !refreshing) {
        return <LoadingSpinner message="Accessing Medical Records..." />;
    }

    return (
        <View style={styles.mainContainer}>
            <ScreenHeader
                title="Medical Services"
                subtitle={`${filteredServices.length} Items in ${selectedCategory}`}
                rightAction={
                    canManageServices && (
                        <Pressable
                            style={({ pressed }) => [
                                styles.addButton,
                                { backgroundColor: pressed ? COLORS.tealPale : COLORS.tealBright }
                            ]}
                            onPress={() => navigation.navigate('ServiceForm')}
                        >
                            <Text style={styles.addButtonText}>+ New</Text>
                        </Pressable>
                    )
                }
            />

            {/* --- CATEGORY FILTER BAR --- */}
            <View style={styles.filterWrapper}>
                <FlatList
                    horizontal
                    data={CATEGORIES}
                    keyExtractor={(item) => item}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoryList}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.categoryChip,
                                selectedCategory === item && styles.activeChip
                            ]}
                            onPress={() => setSelectedCategory(item)}
                        >
                            <Text style={[
                                styles.categoryText,
                                selectedCategory === item && styles.activeCategoryText
                            ]}>
                                {item}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            <FlatList
                data={filteredServices} // Render the FILTERED list
                keyExtractor={(item) => item._id?.toString() || Math.random().toString()}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[COLORS.tealBright]} />
                }
                ListEmptyComponent={
                    <EmptyState 
                        message={selectedCategory === 'All' 
                            ? "No medical services listed." 
                            : `No services found in ${selectedCategory}.`} 
                        onRetry={loadHospitalData} 
                    />
                }
                renderItem={({ item }) => (
                    <ServiceCard
                        service={item}
                        onPress={() => handleServiceSelection(item)}
                    />
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: COLORS.bgPage },
    
    // Category Styles
    filterWrapper: {
        backgroundColor: COLORS.bgPage,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    categoryList: {
        paddingHorizontal: 16,
    },
    categoryChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: RADIUS.full || 25,
        backgroundColor: COLORS.white,
        marginRight: 8,
        borderWidth: 1,
        borderColor: COLORS.tealPale,
        height: 38,
        justifyContent: 'center'
    },
    activeChip: {
        backgroundColor: COLORS.tealBright,
        borderColor: COLORS.tealBright,
    },
    categoryText: {
        fontSize: 12,
        color: COLORS.textMuted,
        fontWeight: '600',
    },
    activeCategoryText: {
        color: COLORS.white,
    },

    scrollContent: { 
        paddingHorizontal: 16,
        paddingTop: 10, 
        paddingBottom: 50 
    },
    addButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: RADIUS.md,
    },
    addButtonText: { 
        color: COLORS.white, 
        fontSize: 12, 
        fontWeight: '800',
        textTransform: 'uppercase'
    },
});

export default ServiceListScreen;