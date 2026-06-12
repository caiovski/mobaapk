import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StatusBar,
  TextInput,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import Constants from 'expo-constants';
import { useNavigation } from '@react-navigation/native';
import Colors from '../../theme/colors';
import { supabase } from '../../../data/datasources/supabase/client';

// SVG imports (Tela 1 Adm);
import MiniLogo from '../../assets/tela1/MiniLogo.svg';
import LogoAgropet from '../../assets/tela1/LogoAgropet.svg';
import CodigoLabel from '../../assets/tela1/CodigoLabel.svg';
import SenhaLabel from '../../assets/tela1/SenhaLabel.svg';
import EntrarTexto from '../../assets/tela1/EntrarTexto.svg';
import Suporte from '../../assets/tela1/Suporte.svg';
import Privacidade from '../../assets/tela1/Privacidade.svg';
import Termos from '../../assets/tela1/Termos.svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// tela de login do adm; tela de login do adm; tela de login do adm
export default function AdminLoginScreen() {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('smooth-worker');
      if (error) throw error;
      Alert.alert('Sucesso', 'Código enviado para o e-mail do proprietário.');
    } catch (e: any) {
      Alert.alert('Erro', 'Não foi possível enviar o código.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }

    setLoading(true);
    let finalEmail = email.trim();

    // Roteador Inteligente
    /* istanbul ignore if */ if (!finalEmail.includes('@')) {
      // Se não tem arroba, assumimos que é o código de 8 dígitos do Admin (Nelson)
      if (finalEmail.length !== 8) {
         Alert.alert('Erro', 'O código do administrador deve conter 8 dígitos numéricos.');
         setLoading(false);
         return;
      }
      
      // Valida o código na tabela temporária
      const { data: codes, error: codeError } = await supabase
        .from('admin_auth_codes')
        .select('id, code, expires_at')
        .eq('code', finalEmail)
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1);
        
      if (codeError || !codes || codes.length === 0) {
        Alert.alert('Acesso Negado', 'Código inválido ou expirado.');
        setLoading(false);
        return;
      }
      
      // Código válido! Substitui pelo e-mail master
      finalEmail = 'nelsonarantes2007@gmail.com';
      
      // Marca o código como usado (dispara sem await estrito para não travar login)
      supabase.from('admin_auth_codes').update({ used: true }).eq('id', codes[0].id).then();
    }

    const { error } = await supabase.auth.signInWithPassword({ email: finalEmail, password });

    if (error) {
      Alert.alert('Erro no Login', error.message);
    }
    // O AuthContext do Admin intercepta e valida role === 'admin' ou 'dev'
    setLoading(false);
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ============ HEADER (Branco retangular) ============ */}
        <View style={styles.headerContainer}>
          {/* Mini Logo - lado esquerdo */}
          <View style={styles.miniLogoWrapper}>
            <MiniLogo width={45} height={45} />
          </View>
        </View>

        {/* ============ MEIO (Fundo Laranja) ============ */}
        <View style={styles.middleContainer}>
          {/* Logo Agropet */}
          <View style={styles.logoWrapper}>
            <LogoAgropet width={SCREEN_WIDTH * 1.00} height={SCREEN_WIDTH * 0.95} />
          </View>

          {/* Texto Bem-vindo de volta, Administrador! */}
          <View style={styles.bemVindoWrapper}>
            <Text style={styles.bemVindoTitle}>Bem-vindo de volta,</Text>
            <Text style={styles.bemVindoTitle}>Administrador!</Text>
          </View>

          {/* Card do formulário (#E96310, borderRadius 25) */}
          <View style={styles.formCard}>
            {/* Campo: Código de administrador */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelWrapper}>
                <CodigoLabel width={230} height={18} />
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="E-mail dev ou cód. adm..."
                placeholderTextColor={Colors.textGray}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <TouchableOpacity onPress={handleSendCode} disabled={loading}>
                <Text style={{ color: Colors.white, fontSize: 13, marginTop: 6, marginLeft: 4, fontWeight: 'bold', textDecorationLine: 'underline' }}>Enviar código</Text>
              </TouchableOpacity>
            </View>

            {/* Campo: Senha do administrador */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelWrapper}>
                <SenhaLabel width={245} height={18} />
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="Digite sua senha..."
                placeholderTextColor={Colors.textGray}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>

          {/* Botão Entrar (Branco, borderRadius 30) */}
          <TouchableOpacity
            testID="admin-login-submit-btn"
            style={styles.entrarButton}
            onPress={handleLogin}
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.textDark} />
            ) : (
              <EntrarTexto width={75} height={19} />
            )}
          </TouchableOpacity>
        </View>

        {/* ============ FOOTER (Retangular #E96310) ============ */}
        <View style={styles.footerContainer}>
          <Text style={{ color: 'rgba(255, 255, 255, 0.6)', textAlign: 'center', fontSize: 12, marginBottom: 8, fontWeight: 'bold' }}>v{Constants.expoConfig?.version || '1.1.0'}</Text>
          <View style={styles.footerContent}>
            {/* Suporte */}
            <TouchableOpacity style={[styles.footerItem, { marginRight: -4 }]} onPress={() => Linking.openURL('https://wa.me/5535998906096')}>
              <Suporte width={85} height={23} />
            </TouchableOpacity>

            {/* Separador 1 */}
            <View style={styles.separator} />

            {/* Privacidade */}
            <TouchableOpacity style={styles.footerItem} onPress={() => navigation.navigate('LegalPages', { type: 'privacy' })}>
              <Privacidade width={127} height={21} />
            </TouchableOpacity>

            {/* Separador 2 */}
            <View style={styles.separator} />

            {/* Termos */}
            <TouchableOpacity style={styles.footerItem} onPress={() => navigation.navigate('LegalPages', { type: 'terms' })}>
              <Termos width={82} height={19} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },

  // ====== HEADER (Retangular Branco) ======
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 0.20,
    paddingBottom: 4,
    backgroundColor: Colors.white,
  },
  miniLogoWrapper: {
    width: 45,
    height: 45,
  },

  // ====== MEIO (Fundo Laranja) ======
  middleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 0,
    paddingBottom: 5,
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },
  bemVindoWrapper: {
    alignItems: 'center',
    marginTop: -20,
    marginBottom: 20,
  },
  bemVindoTitle: {
    fontSize: 30,
    fontWeight: '900',
    color: Colors.white,
    textAlign: 'center',
    lineHeight: 38,
  },


  // Card do formulário (#E96310, borderRadius 25)
  formCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 25,
    paddingVertical: 18,
    paddingHorizontal: 28,
    width: SCREEN_WIDTH * 0.86,
    gap: 6,
  },

  // Campo individual
  fieldGroup: {
    marginBottom: 2,
  },
  labelWrapper: {
    marginBottom: 4,
    marginLeft: 4,
  },

  // Input branco (borderRadius 15)
  textInput: {
    backgroundColor: Colors.white,
    borderRadius: 15,
    height: 38,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Colors.textDark,
  },

  // Botão Entrar (Branco, borderRadius 30)
  entrarButton: {
    backgroundColor: Colors.white,
    borderRadius: 30,
    width: 206,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
  },

  // ====== FOOTER (Retangular #E96310) ======
  footerContainer: {
    backgroundColor: Colors.cardBackground,
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  footerItem: {
    paddingHorizontal: 4,
  },

  // Separador (linha vertical branca)
  separator: {
    width: 1.2,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderRadius: 0.6,
  },
  forgotText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    marginRight: 8,
  },
});
