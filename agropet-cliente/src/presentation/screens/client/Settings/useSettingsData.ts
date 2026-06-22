import { useState, useEffect } from 'react';
import { Alert, Platform, Share } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { supabase } from '../../../../data/datasources/supabase/client';

export default function useSettingsData(user: any) {
  const [deletedAt, setDeletedAt] = useState<string | null>(null);
  const [scheduledDeleteAt, setScheduledDeleteAt] = useState<string | null>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

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
      const auditLogs = data.audit_logs || [];
      const lines: string[] = [];
      const separator = '='.repeat(60);
      const subSeparator = '-'.repeat(40);

      lines.push(separator);
      lines.push('  RELATORIO DE DADOS PESSOAIS - LGPD');
      lines.push(separator);
      lines.push('  Exportado em: ' + (data.exported_at || new Date().toISOString()));
      lines.push('  ID do usuario: ' + (profile.id || ''));
      lines.push('  Tipo de conta: ' + (profile.role === 'admin' ? 'Administrador' : profile.role === 'partner' ? 'Parceiro' : 'Cliente'));
      lines.push(separator);
      lines.push('');

      lines.push(subSeparator);
      lines.push(' 1. INFORMACOES PESSOAIS');
      lines.push(subSeparator);
      lines.push('');
      lines.push('  Nome completo:   ' + (profile.name || '(nao informado)'));
      lines.push('  Nome de usuario: ' + (profile.username || '(nao informado)'));
      lines.push('  Email:           ' + (profile.email || '(nao informado)'));
      lines.push('  Telefone:        ' + (profile.phone || '(nao informado)'));
      lines.push('  Conta criada em: ' + (profile.created_at || '(nao informado)'));
      lines.push('');

      lines.push(subSeparator);
      lines.push(' 2. ENDERECO PRINCIPAL');
      lines.push(subSeparator);
      lines.push('');
      lines.push('  Logradouro: ' + (profile.rua || '(nao informado)'));
      lines.push('  Numero:     ' + (profile.numero || '(nao informado)'));
      lines.push('  Bairro:     ' + (profile.bairro || '(nao informado)'));
      lines.push('  Cidade:     ' + (profile.city || '(nao informado)'));
      lines.push('  CEP:        ' + (profile.cep || '(nao informado)'));
      lines.push('  Endereco completo: ' + (profile.address || '(nao informado)'));
      if (profile.lat && profile.lng) {
        lines.push('  Coordenadas: ' + profile.lat + ', ' + profile.lng);
      }
      lines.push('');

      lines.push(subSeparator);
      lines.push(' 3. REGISTROS DE ATIVIDADE');
      lines.push(subSeparator);
      lines.push('');
      if (auditLogs.length === 0) {
        lines.push('  Nenhum registro de atividade encontrado.');
      } else {
        for (const log of auditLogs) {
          const actionLabels: Record<string, string> = {
            export_user_data: 'Exportacao de dados (LGPD)',
            request_account_deletion: 'Solicitacao de exclusao de conta',
            cancel_account_deletion: 'Cancelamento de exclusao de conta',
            update_email: 'Alteracao de email',
            update_password: 'Alteracao de senha',
            update_phone: 'Alteracao de telefone',
            update_profile: 'Alteracao de perfil',
          };
          const actionLabel = actionLabels[log.action] || log.action;
          lines.push('  - ' + actionLabel);
          lines.push('    Data: ' + (log.created_at || ''));
          if (log.details) {
            lines.push('    Detalhes: ' + (typeof log.details === 'object' ? JSON.stringify(log.details) : log.details));
          }
          lines.push('');
        }
      }

      lines.push(separator);
      lines.push('  FIM DO RELATORIO');
      lines.push(separator);

      const text = lines.join('\n');
      const fileName = 'meus-dados-' + (user?.id?.slice(0, 8) || 'usuario') + '.txt';

      await new Promise<void>((resolve) => {
        Alert.alert(
          'Download de Dados',
          'Tem certeza que deseja fazer o download dos seus dados?',
          [
            { text: 'Cancelar', style: 'cancel', onPress: () => resolve() },
            {
              text: 'Sim', onPress: async () => {
                try {
                  const filePath = FileSystem.cacheDirectory + fileName;
                  await FileSystem.writeAsStringAsync(filePath, text, { encoding: FileSystem.EncodingType.UTF8 });

                  const isSharingAvailable = await Sharing.isAvailableAsync();
                  if (isSharingAvailable) {
                    await Sharing.shareAsync(filePath, { mimeType: 'text/plain' });
                  } else {
                    if (Platform.OS === 'android') {
                      const contentUri = await FileSystem.getContentUriAsync(filePath);
                      await Share.share({ message: contentUri });
                    } else {
                      await Share.share({ url: filePath });
                    }
                  }
                } catch (e: any) {
                  Alert.alert('Erro', e?.message || 'Ocorreu um erro ao exportar seus dados.');
                }
                resolve();
              }
            },
          ]
        );
      });
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
    deletedAt, scheduledDeleteAt,
    exportLoading, deleteLoading,
    handleExportData,
    handleDeleteAccount,
    handleReactivateAccount,
  };
}
