import React from 'react';
import { View, StatusBar, ScrollView, RefreshControl, Text } from 'react-native';
import Constants from 'expo-constants';
import { useProfile } from './useProfile';
import { styles } from './ProfileScreen.styles';
import { CatalogHeader } from '../../../components/CatalogHeader';
import ProfileHeader from './ProfileHeader';
import ProfileContactInfo from './ProfileContactInfo';
import ProfileAddressForm from './ProfileAddressForm';
import ProfileTabBar from './ProfileTabBar';
import UsernameModal from './UsernameModal';
import PhoneModal from './PhoneModal';
import EmailModal from './EmailModal';
import ImagePickerModal from './ImagePickerModal';
import ViewPhotoModal from './ViewPhotoModal';

export default function ProfileScreen() {
  const h = useProfile();

  return (
    <View style={[styles.mainContainer, { backgroundColor: h.colors.backgroundLight }]}>
      <StatusBar backgroundColor={h.colors.headerBackground} barStyle="light-content" />
      <CatalogHeader title="Seu perfil" searchText="" onSearchChange={() => {}} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={h.refreshing} onRefresh={h.handleRefresh} />}
      >
        <ProfileHeader h={h} />
        <ProfileContactInfo h={h} />
        <ProfileAddressForm h={h} />
        <Text style={{ textAlign: 'center', color: '#919191', fontSize: 12, marginTop: 20, marginBottom: 20, fontWeight: 'bold' }}>
          v{Constants.expoConfig?.version || '1.1.0'}
        </Text>
      </ScrollView>
      <ProfileTabBar h={h} />
      <UsernameModal h={h} />
      <PhoneModal h={h} />
      <EmailModal h={h} />
      <ImagePickerModal h={h} />
      <ViewPhotoModal h={h} />
    </View>
  );
}
