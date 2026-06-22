import { useState } from 'react';
import { Alert, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../../../data/datasources/supabase/client';

export function useRegisterScreen() {
  const navigation = useNavigation<any>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não conferem.');
      return;
    }
    if (!acceptedTerms) {
      Alert.alert('Termos', 'Você precisa aceitar os Termos de Uso e Política de Privacidade para se cadastrar.');
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    if (error) {
      Alert.alert('Erro ao cadastrar', error.message);
    } else if (data.session == null) {
      // Quando for confirmado via E-mail (Configuração antiga do Supabase)
      navigation.navigate('OTPVerificationScreen', { email, type: 'signup' });
    } else {
      // Se a confirmação de e-mail estiver desligada no Supabase
      // O App.tsx ou ClientNavigation.tsx automaticamente vai capturar a 'session' e mandar para a Home!
      Alert.alert('Sucesso', 'Cadastro realizado com sucesso!');
    }
    setLoading(false);
  };

  const handleEntrePorAqui = () => {
    navigation.replace('ClientLoginScreen');
  };

  const handleOpenWhatsApp = () => {
    Linking.openURL('https://wa.me/5535998120517');
  };

  const handleOpenPrivacy = () => {
    navigation.navigate('LegalPages', { type: 'privacy' });
  };

  const handleOpenTerms = () => {
    navigation.navigate('LegalPages', { type: 'terms' });
  };

  return {
    name, setName,
    email, setEmail,
    password, setPassword,
    confirmPassword, setConfirmPassword,
    loading,
    acceptedTerms, setAcceptedTerms,
    handleRegister,
    handleEntrePorAqui,
    handleOpenWhatsApp,
    handleOpenPrivacy,
    handleOpenTerms,
  };
}
