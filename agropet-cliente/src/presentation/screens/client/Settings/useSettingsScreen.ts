import { useState, useContext, useEffect } from 'react';
import { Alert, Platform, Share } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system/legacy';
import { AuthContext } from '../../../contexts/AuthContext';
import { useUserMenu } from '../../../contexts/UserMenuContext';
import { supabase } from '../../../../data/datasources/supabase/client';
import { useSettingsEmail } from './useSettingsEmail';
import { useSettingsPassword } from './useSettingsPassword';
import { useSettingsPermissions } from './useSettingsPermissions';
import { useSettingsTheme } from './useSettingsTheme';

export function useSettingsScreen() {
  const { toggleMenu } = useUserMenu();
  const navigation = useNavigation<any>();
  const { user } = useContext(AuthContext);

  const [searchText, setSearchText] = useState('');
  const [phone, setPhone] = useState('');
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [phoneStatus, setPhoneStatus] = useState<'cadastrar' | 'validar' | 'alterar'>('cadastrar');
  const [deletedAt, setDeletedAt] = useState<string | null>(null);
  const [scheduledDeleteAt, setScheduledDeleteAt] = useState<string | null>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const userEmail = user?.new_email || user?.email || 'meuemail@gmail.com';

  const emailHook = useSettingsEmail();
  const passwordHook = useSettingsPassword(userEmail);
  const permissionsHook = useSettingsPermissions();
  const themeHook = useSettingsTheme();

  useEffect(() => {
    if (!user) return;
    const fetchPhone = async () => {
      const { data } = await supabase.from('users').select('phone').eq('id', user.id).single();
      if (data && data.phone) {
        setPhone(data.phone);
        setPhoneStatus('alterar');
      } else {
        setPhoneStatus('cadastrar');
      }
    };
    fetchPhone();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const fetchDeletionStatus = async () => {
      const { data } = await supabase
        .from('users')
        .select('deleted_at, scheduled_delete_at')
        .eq('id', user.id)
        .single();
      if (data) {
        setDeletedAt(data.deleted_at);
        setScheduledDeleteAt(data.scheduled_delete_at);
      }
    };
    fetchDeletionStatus();
  }, [user]);

  const handleConfirmPhone = async () => {
    if (phoneStatus === 'cadastrar' || phoneStatus === 'alterar') {
      setPhoneStatus('validar');
    } else if (phoneStatus === 'validar') {
      if (user) {
        await supabase.from('users').update({ phone: phoneInput }).eq('id', user.id);
        setPhone(phoneInput);
        setPhoneStatus('alterar');
        setShowPhoneModal(false);
        Alert.alert('Sucesso', 'Telefone cadastrado com sucesso!');
      }
    }
  };

  const handleExportData = async () => {
    setExportLoading(true);
    try {
      const { data, error } = await supabase.rpc('export_user_data');
      if (error) {
        Alert.alert('Erro', error.message || 'Não foi possível exportar seus dados.');
        return;
      }
      if (!data?.success) {
        Alert.alert('Erro', data?.error || 'Erro ao exportar dados.');
        return;
      }
      const profile = data.profile || {};
      const orders = data.orders || [];
      const payments = data.payments || [];
      const lines: string[] = [];
      lines.push('=== MEUS DADOS ===');
      lines.push(`Exportado em: ${data.exported_at || new Date().toISOString()}`);
      lines.push('');
      lines.push('--- PERFIL ---');
      lines.push(`Nome: ${profile.name || ''}`);
      lines.push(`Email: ${profile.email || ''}`);
      lines.push(`Telefone: ${profile.phone || ''}`);
      lines.push(`Endereço: ${profile.address || ''}`);
      lines.push(`Cidade: ${profile.city || ''}`);
      lines.push(`CEP: ${profile.cep || ''}`);
      lines.push('');
      lines.push('--- PEDIDOS ---');
      if (orders.length === 0) {
        lines.push('Nenhum pedido encontrado.');
      } else {
        for (const item of orders) {
          const o = item.order || {};
          lines.push(`Pedido #${o.id || ''} - ${o.status || ''} - R$ ${o.total || '0,00'}`);
          if (o.created_at) lines.push(`  Data: ${o.created_at}`);
          if (o.delivery_type) lines.push(`  Entrega: ${o.delivery_type}`);
          if (o.payment_method) lines.push(`  Pagamento: ${o.payment_method}`);
          const itemsList = item.items || [];
          for (const prod of itemsList) {
            lines.push(`  - ${prod.name || 'Produto'} x${prod.quantity || 1} = R$ ${(prod.unit_price * prod.quantity).toFixed(2)}`);
          }
          lines.push('');
        }
      }
      lines.push('--- PAGAMENTOS ---');
      if (payments.length === 0) {
        lines.push('Nenhum pagamento encontrado.');
      } else {
        for (const pt of payments) {
          lines.push(`Transação: ${pt.id || ''} - ${pt.status || ''} - R$ ${pt.amount || '0,00'}`);
        }
      }
      const text = lines.join('\n');
      const fileName = `meus-dados-${user?.id?.slice(0, 8)}.txt`;
      const filePath = `${FileSystem.cacheDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(filePath, text);
      await Share.share({ message: text, url: Platform.OS === 'ios' ? filePath : undefined });
      Alert.alert('Dados Exportados', `Arquivo "${fileName}" gerado com seus dados pessoais.`);
    } catch (e: any) {
      Alert.alert('Erro', e?.message || 'Ocorreu um erro ao exportar seus dados.');
    } finally {
      setExportLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Excluir Conta',
      'Sua conta será desativada imediatamente e todos os seus dados serão permanentemente removidos após 30 dias.\n\nVocê pode reativar sua conta dentro desse período.\n\nTem certeza que deseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir Conta',
          style: 'destructive',
          onPress: async () => {
            setDeleteLoading(true);
            try {
              const { data, error } = await supabase.rpc('request_account_deletion');
              if (error || !data?.success) {
                Alert.alert('Erro', data?.error || 'Não foi possível solicitar a exclusão.');
                return;
              }
              setDeletedAt(data.deleted_at);
              setScheduledDeleteAt(data.scheduled_delete_at);
              Alert.alert(
                'Exclusão Agendada',
                'Sua conta foi desativada. Você tem 30 dias para reativá-la antes da remoção permanente.'
              );
            } catch {
              Alert.alert('Erro', 'Ocorreu um erro ao solicitar a exclusão.');
            } finally {
              setDeleteLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleReactivateAccount = async () => {
    try {
      const { data, error } = await supabase.rpc('cancel_account_deletion');
      if (error || !data?.success) {
        if (data?.error === 'PRAZO_EXPIRADO') {
          Alert.alert('Prazo Expirado', 'O prazo de 30 dias para reativação expirou. Sua exclusão não pode ser cancelada.');
        } else {
          Alert.alert('Erro', data?.error || 'Não foi possível reativar a conta.');
        }
        return;
      }
      setDeletedAt(null);
      setScheduledDeleteAt(null);
      Alert.alert('Conta Reativada', 'Sua conta foi reativada com sucesso!');
    } catch {
      Alert.alert('Erro', 'Ocorreu um erro ao reativar a conta.');
    }
  };

  return {
    navigation,
    user,
    colors: themeHook.colors,
    isDarkMode: themeHook.isDarkMode,
    toggleTheme: themeHook.toggleTheme,

    searchText,
    setSearchText,

    phone,
    phoneStatus,
    showPhoneModal,
    setShowPhoneModal,
    phoneInput,
    setPhoneInput,
    handleConfirmPhone,

    showEmailModal: emailHook.showEmailModal,
    setShowEmailModal: emailHook.setShowEmailModal,
    emailInput: emailHook.emailInput,
    setEmailInput: emailHook.setEmailInput,
    emailStatus: emailHook.emailStatus,
    emailError: emailHook.emailError,
    emailCode: emailHook.emailCode,
    setEmailCode: emailHook.setEmailCode,
    handleConfirmEmail: emailHook.handleConfirmEmail,

    showPasswordModal: passwordHook.showPasswordModal,
    setShowPasswordModal: passwordHook.setShowPasswordModal,
    currentPassword: passwordHook.currentPassword,
    setCurrentPassword: passwordHook.setCurrentPassword,
    newPassword: passwordHook.newPassword,
    setNewPassword: passwordHook.setNewPassword,
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

    deletedAt,
    scheduledDeleteAt,
    exportLoading,
    deleteLoading,
    handleExportData,
    handleDeleteAccount,
    handleReactivateAccount,
  };
}
