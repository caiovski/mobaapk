import { useState, useContext } from 'react';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../../contexts/AuthContext';
import { useUserMenu } from '../../../contexts/UserMenuContext';
import { useSettingsEmail } from './useSettingsEmail';
import { useSettingsPassword } from './useSettingsPassword';
import { useSettingsPermissions } from './useSettingsPermissions';
import { useSettingsTheme } from './useSettingsTheme';
import useSettingsPhone from './useSettingsPhone';
import useSettingsData from './useSettingsData';

export function useSettingsScreen() {
  const { toggleMenu } = useUserMenu();
  const navigation = useNavigation<any>();
  const { user } = useContext(AuthContext);

  const [searchText, setSearchText] = useState('');

  const userEmail = user?.new_email || user?.email || 'meuemail@gmail.com';

  const emailHook = useSettingsEmail();
  const passwordHook = useSettingsPassword(userEmail);
  const permissionsHook = useSettingsPermissions();
  const themeHook = useSettingsTheme();
  const phoneHook = useSettingsPhone(user);
  const dataHook = useSettingsData(user);

  return {
    navigation,
    user,
    colors: themeHook.colors,
    isDarkMode: themeHook.isDarkMode,
    toggleTheme: themeHook.toggleTheme,

    searchText,
    setSearchText,

    ...phoneHook,

    showEmailModal: emailHook.showEmailModal,
    setShowEmailModal: emailHook.setShowEmailModal,
    emailInput: emailHook.emailInput,
    setEmailInput: emailHook.setEmailInput,
    emailStatus: emailHook.emailStatus,
    emailError: emailHook.emailError,
    setEmailError: emailHook.setEmailError,
    emailCode: emailHook.emailCode,
    setEmailCode: emailHook.setEmailCode,
    handleConfirmEmail: emailHook.handleConfirmEmail,

    showPasswordModal: passwordHook.showPasswordModal,
    setShowPasswordModal: passwordHook.setShowPasswordModal,
    currentPassword: passwordHook.currentPassword,
    setCurrentPassword: passwordHook.setCurrentPassword,
    newPassword: passwordHook.newPassword,
    setNewPassword: passwordHook.newPassword,
    confirmNewPassword: passwordHook.confirmNewPassword,
    setConfirmNewPassword: passwordHook.setConfirmNewPassword,
    passwordCode: passwordHook.passwordCode,
    setPasswordCode: passwordHook.setPasswordCode,
    showCurrentPassword: passwordHook.showCurrentPassword,
    setShowCurrentPassword: passwordHook.setShowCurrentPassword,
    showNewPassword: passwordHook.showNewPassword,
    setShowNewPassword: passwordHook.setShowNewPassword,
    showConfirmNewPassword: passwordHook.showConfirmNewPassword,
    setShowConfirmNewPassword: passwordHook.setShowConfirmNewPassword,
    passwordError: passwordHook.passwordError,
    setPasswordError: passwordHook.setPasswordError,
    showNestedModal: passwordHook.showNestedModal,
    setShowNestedModal: passwordHook.setShowNestedModal,
    handleSendOtpCode: passwordHook.handleSendOtpCode,
    handleConfirmFinal: passwordHook.handleConfirmFinal,
    isPasswordMatch: passwordHook.isPasswordMatch,

    showGreeting: themeHook.showGreeting,
    handleToggleGreeting: themeHook.handleToggleGreeting,

    notificationsEnabled: permissionsHook.notificationsEnabled,
    handleToggleNotifications: permissionsHook.handleToggleNotifications,

    cameraPermission: permissionsHook.cameraPermission,
    galleryPermission: permissionsHook.galleryPermission,
    locationPermission: permissionsHook.locationPermission,
    notificationsPermission: permissionsHook.notificationsPermission,
    showPermissionsModal: permissionsHook.showPermissionsModal,
    setShowPermissionsModal: permissionsHook.setShowPermissionsModal,
    handleOpenPermissions: permissionsHook.handleOpenPermissions,
    handlePressPermission: permissionsHook.handlePressPermission,

    themeSwitchAnim: themeHook.themeSwitchAnim,
    notifSwitchAnim: permissionsHook.notifSwitchAnim,
    greetingSwitchAnim: themeHook.greetingSwitchAnim,
    themeIconRotate: themeHook.themeIconRotate,
    themeIconScale: themeHook.themeIconScale,
    notifIconRotate: permissionsHook.notifIconRotate,
    permIconScale: permissionsHook.permIconScale,
    greetingIconRotate: themeHook.greetingIconRotate,
    greetingIconScale: themeHook.greetingIconScale,
    themeRotateInterpolate: themeHook.themeRotateInterpolate,
    notifRotateInterpolate: permissionsHook.notifRotateInterpolate,
    greetingRotateInterpolate: themeHook.greetingRotateInterpolate,
    handleToggleTheme: themeHook.handleToggleTheme,

    userEmail,

    ...dataHook,
  };
}
