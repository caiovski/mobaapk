import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { useLegalPagesScreen } from './useLegalPagesScreen';
import { styles } from './LegalPagesScreen.styles';

export default function LegalPagesScreen() {
  const { pageType, handleClose } = useLegalPagesScreen();
  const isPrivacy = pageType === 'privacy';

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#E96310" barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isPrivacy ? 'Privacidade' : 'Termos de Uso'}</Text>
      </View>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {isPrivacy ? (
          <>
            <Text style={styles.paragraph}>
              Sua privacidade como administrador é importante para nós. Esta política explica
              como coletamos, usamos, armazenamos e protegemos os dados gerenciados através
              do painel administrativo do AgroPet, em conformidade com a LGPD.
            </Text>
            <Text style={styles.sectionTitle}>Dados Acessados</Text>
            <Text style={styles.paragraph}>
              Como administrador, você tem acesso a dados de clientes como nome, e-mail,
              endereço, telefone e histórico de pedidos. Estes dados são fornecidos pelos
              próprios clientes no momento do cadastro e só devem ser usados para fins
              operacionais do aplicativo.
            </Text>
            <Text style={styles.sectionTitle}>Responsabilidades do Administrador</Text>
            <Text style={styles.paragraph}>
              Você é responsável por manter a confidencialidade das credenciais de acesso
              ao painel administrativo. Não compartilhe sua conta com terceiros. Todos os
              acessos são registrados para auditoria.
            </Text>
            <Text style={styles.sectionTitle}>Uso dos Dados</Text>
            <Text style={styles.paragraph}>
              Os dados acessados via painel devem ser utilizados exclusivamente para:
              processamento de pedidos, gestão de entregas, contato com clientes para
              fins de serviço, e administração da loja. Não é permitido compartilhar
              dados de clientes fora do ambiente do aplicativo.
            </Text>
            <Text style={styles.sectionTitle}>Segurança</Text>
            <Text style={styles.paragraph}>
              Utilizamos criptografia e medidas de segurança para proteger os dados
              armazenados. O administrador deve utilizar senhas fortes e manter o
              aplicativo atualizado para garantir a segurança do sistema.
            </Text>
            <Text style={styles.sectionTitle}>Seus Direitos</Text>
            <Text style={styles.paragraph}>
              Você pode solicitar a exportação ou exclusão dos dados relacionados à
              sua conta de administrador através das configurações do aplicativo.
              Respeitamos seu direito à privacidade e transparência.
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.paragraph}>
              Ao utilizar o painel administrativo do AgroPet, você concorda com os
              termos e condições descritos abaixo. Este acesso é restrito a
              administradores autorizados.
            </Text>
            <Text style={styles.sectionTitle}>1. Acesso Restrito</Text>
            <Text style={styles.paragraph}>
              O painel administrativo é de uso exclusivo de administradores autorizados
              da AgroPet Lambari. Cada administrador é responsável por todas as ações
              realizadas em sua conta.
            </Text>
            <Text style={styles.sectionTitle}>2. Uso do Sistema</Text>
            <Text style={styles.paragraph}>
              O sistema deve ser utilizado exclusivamente para gestão de pedidos,
              entregas, produtos e demais atividades operacionais da AgroPet. Não é
              permitido utilizar o acesso para fins pessoais ou não autorizados.
            </Text>
            <Text style={styles.sectionTitle}>3. Sigilo e Confidencialidade</Text>
            <Text style={styles.paragraph}>
              O administrador se compromete a manter sigilo absoluto sobre informações
              de clientes, estratégias operacionais e dados sensíveis acessados através
              do painel. O vazamento de informações poderá resultar em sanções legais.
            </Text>
            <Text style={styles.sectionTitle}>4. Gestão de Pedidos</Text>
            <Text style={styles.paragraph}>
              O administrador é responsável por atualizar corretamente o status dos
              pedidos, garantindo que os clientes recebam notificações precisas sobre
              suas entregas. Alterações indevidas podem causar prejuízos aos clientes.
            </Text>
            <Text style={styles.sectionTitle}>5. Cancelamento e Exclusão</Text>
            <Text style={styles.paragraph}>
              A AgroPet se reserva o direito de revogar o acesso administrativo de
              qualquer usuário que violar estes termos. Em caso de desligamento, o
              acesso deve ser imediatamente desativado.
            </Text>
          </>
        )}
      </ScrollView>
    </View>
  );
}
