import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, Easing } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../../../../contexts/ThemeContext';

export default function FreteBanner() {
  const { isDarkMode } = useTheme();
  const isFreeShipDay = [2, 4, 5].includes(new Date().getDay());

  const shineAnim = useRef(new Animated.Value(-1)).current;
  
  // Animações da Caixa
  const [isOpen, setIsOpen] = useState(true);
  const spinAnim = useRef(new Animated.Value(0)).current;
  const confettiAnim = useRef(new Animated.Value(1)).current; // Inicia aberta e expandida
  const floatElementsAnim = useRef(new Animated.Value(0)).current; // Efeito flutuante contínuo

  useEffect(() => {
    // Animação de brilho contínua
    Animated.loop(
      Animated.timing(shineAnim, { toValue: 2, duration: 3500, easing: Easing.linear, useNativeDriver: true })
    ).start();

    // Efeito flutuante contínuo para os elementos fora da caixa
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatElementsAnim, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(floatElementsAnim, { toValue: 0, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    // Loop da caixa dinâmico
    const loop = () => {
      // 1. "Suga" os confetes de volta para a caixa rapidamente antes de fechar
      Animated.timing(confettiAnim, {
        toValue: 0,
        duration: 200, // Encolhe bem rápido
        easing: Easing.in(Easing.ease), 
        useNativeDriver: true,
      }).start(() => {
        // 2. Transição para caixa fechada
        setIsOpen(false);
        spinAnim.setValue(0);
        
        // 3. Gira a caixa no ar
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 700, // Tempo de giro rápido
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }).start(() => {
          // 4. Transição para caixa aberta
          setIsOpen(true);
          
          // 5. Explode os confetes novamente (animação de abertura)
          Animated.timing(confettiAnim, {
            toValue: 1,
            duration: 600,
            easing: Easing.out(Easing.back(2)), // Efeito de explosão saltitante
            useNativeDriver: true,
          }).start();
        });
      });
    };

    const intervalId = setInterval(loop, 4500); // Repete a cada 4.5 segundos
    return () => clearInterval(intervalId);
  }, []);

  const shineTranslateX = shineAnim.interpolate({ inputRange: [-1, 2], outputRange: [-200, 600] });
  
  const boxRotate = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-15deg', '345deg'], // Um giro completo 360 começando em -15deg (inclinada pra esquerda)
  });

  const confettiScale = confettiAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  
  // Interpolação do flutuador contínuo (sobe e desce mais alto no eixo Y)
  const floatingY = floatElementsAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -16] });

  const getConfettiTranslate = (x: number, y: number) => {
    return {
      translateX: confettiAnim.interpolate({ inputRange: [0, 1], outputRange: [0, x] }),
      // O Y é a soma da explosão do confete com o flutuador contínuo
      translateY: Animated.add(
        confettiAnim.interpolate({ inputRange: [0, 1], outputRange: [0, y] }),
        floatingY
      ),
    };
  };

  const bgMain = isDarkMode ? '#1A4D55' : '#4CD2DD';
  const textDark = isDarkMode ? '#FFFFFF' : '#3A4B4E';
  const textWhite = '#FFFFFF';
  const textAccent = isDarkMode ? '#FFD54F' : '#FFCA28';
  
  const textShadow = {
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  };

  const iconColor = isDarkMode ? '#5A9BD5' : '#FFFFFF'; 

  return (
    <View style={{
      overflow: 'hidden',
      backgroundColor: bgMain,
      elevation: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      position: 'relative',
    }}>
      {/* Nuvens / Bolhas decorativas no fundo */}
      <View style={{ position: 'absolute', top: -30, right: -20, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.2)' }} />
      <View style={{ position: 'absolute', top: 20, right: 60, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.15)' }} />
      <View style={{ position: 'absolute', bottom: -40, left: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.1)' }} />
      
      {/* Linhas de velocidade */}
      <View style={{ position: 'absolute', bottom: 15, right: 110, width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.3)', transform: [{ skewX: '-30deg' }] }} />
      <View style={{ position: 'absolute', bottom: 25, right: 100, width: 60, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.3)', transform: [{ skewX: '-30deg' }] }} />
      <View style={{ position: 'absolute', bottom: 35, right: 120, width: 30, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.3)', transform: [{ skewX: '-30deg' }] }} />

      {/* Efeito de Brilho */}
      <Animated.View style={{
        position: 'absolute', top: 0, bottom: 0, width: 80, backgroundColor: 'rgba(255,255,255,0.25)',
        transform: [{ skewX: '-25deg' }, { translateX: shineTranslateX }],
        zIndex: 5,
      }} />

      <View style={{ paddingVertical: 20, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', zIndex: 10 }}>
        
        {/* Textos */}
        <View style={{ flex: 1 }}>
          <Text style={{
            fontSize: 34, fontWeight: '900', color: textDark,
            letterSpacing: 1, textTransform: 'uppercase',
            lineHeight: 34, ...textShadow
          }}>
            FRETE{'\n'}GRÁTIS
          </Text>
          <Text style={{ 
            fontSize: 12, fontWeight: '800', color: textWhite, 
            letterSpacing: 0.5, marginTop: 4, marginBottom: -2, ...textShadow 
          }}>
            EM COMPRAS A PARTIR DE
          </Text>
          <Text style={{
            fontSize: 34, fontWeight: '900', color: textDark,
            letterSpacing: 1, ...textShadow
          }}>
            R$ 30,00
          </Text>
          
          {isFreeShipDay && (
            <View style={{
              alignSelf: 'flex-start', backgroundColor: textAccent,
              paddingVertical: 4, paddingHorizontal: 12, borderRadius: 12,
              marginTop: 6, elevation: 2,
            }}>
              <Text style={{ fontSize: 11, fontWeight: '900', color: '#B33A3A', letterSpacing: 0.5 }}>
                🚚 HOJE É DIA DE FRETE GRÁTIS!
              </Text>
            </View>
          )}
        </View>

        {/* Caixa Animada */}
        <View style={{ width: 120, height: 120, justifyContent: 'center', alignItems: 'center', marginRight: 15 }}>
          
          <Animated.View style={{
            transform: [{ rotate: boxRotate }],
            shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 10,
          }}>
            <View style={{
              justifyContent: 'center', alignItems: 'center',
            }}>
              {isOpen ? (
                <FontAwesome5 name="box-open" size={72} color={iconColor} style={{ marginTop: 14 }} />
              ) : (
                <FontAwesome5 name="box" size={76} color={iconColor} />
              )}

              {/* Ícone de Cone com confetes estourando */}
              <Animated.View style={{
                position: 'absolute',
                top: -26,
                transform: [{ scale: confettiScale }, { translateY: floatingY }],
              }}>
                <Text style={{ fontSize: 40 }}>🎉</Text>
              </Animated.View>

              {/* Partículas de Confete (Pedaços coloridos) flutuando */}
              <Animated.View style={{ position: 'absolute', width: 10, height: 10, backgroundColor: '#FF5252', borderRadius: 5, transform: [{ translateX: getConfettiTranslate(-40, -45).translateX }, { translateY: getConfettiTranslate(-40, -45).translateY }, { scale: confettiScale }] }} />
              <Animated.View style={{ position: 'absolute', width: 7, height: 7, backgroundColor: '#448AFF', transform: [{ translateX: getConfettiTranslate(45, -35).translateX }, { translateY: getConfettiTranslate(45, -35).translateY }, { scale: confettiScale }, { rotate: '45deg' }] }} />
              <Animated.View style={{ position: 'absolute', width: 10, height: 10, backgroundColor: '#FFEB3B', borderRadius: 5, transform: [{ translateX: getConfettiTranslate(-20, -60).translateX }, { translateY: getConfettiTranslate(-20, -60).translateY }, { scale: confettiScale }] }} />
              <Animated.View style={{ position: 'absolute', width: 7, height: 7, backgroundColor: '#69F0AE', transform: [{ translateX: getConfettiTranslate(35, -55).translateX }, { translateY: getConfettiTranslate(35, -55).translateY }, { scale: confettiScale }, { rotate: '15deg' }] }} />
              <Animated.View style={{ position: 'absolute', width: 11, height: 11, backgroundColor: '#E040FB', borderRadius: 5.5, transform: [{ translateX: getConfettiTranslate(0, -75).translateX }, { translateY: getConfettiTranslate(0, -75).translateY }, { scale: confettiScale }] }} />
            </View>
          </Animated.View>
        </View>

      </View>
    </View>
  );
}
