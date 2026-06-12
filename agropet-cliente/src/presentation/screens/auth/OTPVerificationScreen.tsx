import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { supabase } from '../../../data/datasources/supabase/client';
import { Colors } from '../../theme/colors';
import { SafeAreaView } from 'react-native-safe-area-context';

export function OTPVerificationScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { email, type } = route.params || {}; // type pode ser 'signup' ou 'recovery' ou 'email_change'

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Atenção', 'Digite o código de 6 dígitos corretamente.');
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: type as any,
    });

    setLoading(false);

    if (error) {
      Alert.alert('Erro', 'Código inválido ou expirado. Tente novamente.');
      return;
    }

    if (type === 'signup') {
      Alert.alert('Sucesso!', 'Sua conta foi verificada com sucesso. Você pode fazer login agora.');
      navigation.reset({ index: 0, routes: [{ name: 'ClientLoginScreen' }] });
    } else if (type === 'email_change') {
       Alert.alert('Sucesso!', 'E-mail atualizado com sucesso.');
       navigation.goBack();
    }
  };

  const handleResend = async () => {
    setLoading(true);
    let error = null;
    
    if (type === 'signup') {
       const res = await supabase.auth.resend({ type: 'signup', email });
       error = res.error;
    } else if (type === 'recovery') {
       const res = await supabase.auth.resetPasswordForEmail(email);
       error = res.error;
    }
    
    setLoading(false);
    
    if (error) {
       Alert.alert('Erro', error.message);
    } else {
       Alert.alert('Sucesso', 'Um novo código foi enviado para o seu e-mail.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.title}>Verificação de E-mail</Text>
          <Text style={styles.subtitle}>Enviamos um código de 6 dígitos para:</Text>
          <Text style={styles.emailText}>{email}</Text>

          <TextInput
            style={styles.input}
            placeholder="000000"
            placeholderTextColor="#ccc"
            keyboardType="number-pad"
            maxLength={6}
            value={otp}
            onChangeText={setOtp}
            autoFocus
          />

          <TouchableOpacity style={styles.button} onPress={handleVerify} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Verificando...' : 'Confirmar Código'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.resendButton} onPress={handleResend} disabled={loading}>
            <Text style={styles.resendText}>Não recebeu? Reenviar código</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: Colors.primary, marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#333', textAlign: 'center' },
  emailText: { fontSize: 16, fontWeight: 'bold', color: Colors.primary, marginBottom: 30, textAlign: 'center' },
  input: {
    width: 200,
    height: 60,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 10,
    fontSize: 32,
    textAlign: 'center',
    letterSpacing: 8,
    marginBottom: 30,
    color: '#000'
  },
  button: {
    backgroundColor: Colors.primary,
    width: '100%',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  resendButton: { padding: 10 },
  resendText: { color: Colors.primary, fontWeight: '600' }
});
