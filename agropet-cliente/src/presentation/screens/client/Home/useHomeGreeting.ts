import { useState, useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { supabase } from '../../../../data/datasources/supabase/client';
import { getShopStatus } from '../../../../utils/shopHours';

export default function useHomeGreeting(user: any, isAdmin: boolean, setIsAdmin: (v: boolean) => void) {
  const [clientName, setClientName] = useState('');
  const [greeting, setGreeting] = useState('');
  const [shopStatus, setShopStatusState] = useState<any>(null);
  const [showGreetingBar, setShowGreetingBar] = useState(true);

  const greetingOpacity = useRef(new Animated.Value(1)).current;
  const greetingScale = useRef(new Animated.Value(1)).current;
  const closeButtonRotate = useRef(new Animated.Value(0)).current;
  const closeButtonScale = useRef(new Animated.Value(1)).current;

  const fetchProfileName = async () => {
    if (user?.id) {
      try {
        const { data } = await supabase
          .from('users')
          .select('name, role')
          .eq('id', user.id)
          .single();
        if (data?.name) {
          const firstName = data.name.trim().split(' ')[0];
          setClientName(firstName);
        } else {
          setClientName('');
        }
        setIsAdmin(data?.role === 'admin');
      } catch (e) {
        console.log('Erro ao buscar nome do cliente para a saudação:', e);
      }
    } else {
      setClientName('');
      setIsAdmin(false);
    }
  };

  const checkGreetingPreference = async () => {
    try {
      const val = await SecureStore.getItemAsync('show_greeting_bar');
      if (val === 'false') {
        setShowGreetingBar(false);
      } else {
        greetingOpacity.setValue(0);
        greetingScale.setValue(0.95);
        closeButtonRotate.setValue(0);
        closeButtonScale.setValue(1);
        setShowGreetingBar(true);

        Animated.parallel([
          Animated.timing(greetingOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(greetingScale, { toValue: 1, duration: 400, useNativeDriver: true }),
        ]).start();
      }
    } catch (e) {
      console.log('Erro ao ler preferência de saudação:', e);
    }
  };

  const handleDismissGreeting = () => {
    Animated.parallel([
      Animated.timing(closeButtonRotate, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(closeButtonScale, { toValue: 0, duration: 450, useNativeDriver: true }),
      Animated.timing(greetingOpacity, { toValue: 0, duration: 450, useNativeDriver: true }),
      Animated.timing(greetingScale, { toValue: 0.95, duration: 450, useNativeDriver: true }),
    ]).start(async () => {
      setShowGreetingBar(false);
      try {
        await SecureStore.setItemAsync('show_greeting_bar', 'false');
      } catch (e) {
        console.log('Erro ao salvar preferência de saudação:', e);
      }
    });
  };

  useEffect(() => {
    fetchProfileName();
    checkGreetingPreference();
  }, [user]);

  useEffect(() => {
    const updateStatus = () => {
      const now = new Date();
      const status = getShopStatus(now);

      if (isAdmin) {
        setGreeting('Bem-vindo admin, o que vamos testar hoje?');
        if (status.isOpen) {
          setShopStatusState(status);
        } else {
          setShopStatusState({ ...status, isOpen: true, countdownText: 'Modo teste — loja fechada' });
        }
      } else {
        setShopStatusState(status);
        const hour = now.getHours();
        const isDay = hour >= 6 && hour < 18;
        const nameToUse = clientName || 'Cliente';
        if (isDay) {
          setGreeting(`Bom dia, ${nameToUse}!`);
        } else {
          setGreeting(`Boa noite, ${nameToUse}!`);
        }
      }
    };

    updateStatus();
    const interval = setInterval(updateStatus, 1000);
    return () => clearInterval(interval);
  }, [clientName, isAdmin]);

  return {
    clientName, greeting, shopStatus, showGreetingBar,
    greetingOpacity, greetingScale, closeButtonRotate, closeButtonScale,
    fetchProfileName, checkGreetingPreference, handleDismissGreeting,
  };
}
