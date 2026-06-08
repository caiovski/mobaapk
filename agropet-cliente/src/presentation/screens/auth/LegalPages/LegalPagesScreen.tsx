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
              Sua privacidade é importante para nós. Esta política explica como coletamos,
              usamos, armazenamos e protegemos seus dados pessoais ao utilizar o aplicativo
              AgroPet, em conformidade com a Lei Geral de Proteção de Dados (LGPD).
            </Text>
            <Text style={styles.sectionTitle}>Dados Coletados</Text>
            <Text style={styles.paragraph}>
              Coletamos as seguintes informações: nome, e-mail, endereço, telefone, dados de
              localização (para entrega) e histórico de pedidos. Estes dados são fornecidos
              voluntariamente por você no momento do cadastro e durante o uso do aplicativo.
            </Text>
            <Text style={styles.sectionTitle}>Uso dos Dados</Text>
            <Text style={styles.paragraph}>
              Seus dados são utilizados exclusivamente para: processar e entregar seus pedidos,
              manter sua conta ativa, enviar notificações sobre o status do pedido, e melhorar
              nossos serviços. Não compartilhamos seus dados com terceiros para fins de marketing.
            </Text>
            <Text style={styles.sectionTitle}>Armazenamento e Segurança</Text>
            <Text style={styles.paragraph}>
              Seus dados são armazenados de forma segura em servidores criptografados. Utilizamos
              medidas técnicas e organizacionais para proteger suas informações contra acesso não
              autorizado, perda ou vazamento.
            </Text>
            <Text style={styles.sectionTitle}>Seus Direitos</Text>
            <Text style={styles.paragraph}>
              Você pode solicitar a qualquer momento a exportação, correção ou exclusão dos seus
              dados pessoais através das configurações do aplicativo (LGPD). Respeitamos seu
              direito à privacidade e transparência.
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.paragraph}>
              Ao utilizar o aplicativo AgroPet, você concorda com os termos e condições descritos
              abaixo. Recomendamos a leitura completa antes de utilizar nossos serviços.
            </Text>
            <Text style={styles.sectionTitle}>1. Serviços Oferecidos</Text>
            <Text style={styles.paragraph}>
              O AgroPet é um aplicativo de delivery de produtos agropecuários. Facilitamos a
              compra e entrega de produtos para animais de estimação e insumos agropecuários
              na região de Lambari - MG e arredores.
            </Text>
            <Text style={styles.sectionTitle}>2. Responsabilidades do Usuário</Text>
            <Text style={styles.paragraph}>
              O usuário se compromete a fornecer informações verdadeiras e atualizadas no
              cadastro. É de sua responsabilidade manter a confidencialidade de sua senha e
              não compartilhar sua conta com terceiros.
            </Text>
            <Text style={styles.sectionTitle}>3. Pedidos e Entregas</Text>
            <Text style={styles.paragraph}>
              Os pedidos estão sujeitos à disponibilidade dos produtos. O prazo de entrega
              pode variar conforme a distância e condições logísticas. A AgroPet não se
              responsabiliza por atrasos causados por fatores externos.
            </Text>
            <Text style={styles.sectionTitle}>4. Cancelamentos e Reembolsos</Text>
            <Text style={styles.paragraph}>
              Cancelamentos podem ser solicitados antes do status "Saiu para entrega". Após
              esse estágio, o reembolso será avaliado caso a caso. Em caso de produtos com
              defeito, o usuário deve entrar em contato pelo Suporte.
            </Text>
            <Text style={styles.sectionTitle}>5. Alterações nos Termos</Text>
            <Text style={styles.paragraph}>
              A AgroPet se reserva o direito de alterar estes termos a qualquer momento.
              Notificaremos os usuários sobre mudanças significativas através do aplicativo
              ou e-mail cadastrado.
            </Text>
          </>
        )}
      </ScrollView>
    </View>
  );
}
