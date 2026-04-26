import React, { useState, useCallback, useContext } from 'react';
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

export default ServiceListScreen;