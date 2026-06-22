# Design: Botão Voltar ao Topo + Cor do Campo de Data (Admin)

## 1. Componente ScrollToTopButton

### Props

```ts
interface ScrollToTopButtonProps {
  scrollRef: React.RefObject<ScrollView | FlatList<any>>;
  isFlatList?: boolean; // true para FlatList, false para ScrollView
  visibleThreshold?: number; // px de scroll para mostrar o botão (default 500)
}
```

### Especificação Visual

```
        ┌─────┐
        │  ↑  │   ← seta para cima (Feather "chevron-up" ou "arrow-up")
        │     │
        └─────┘
    ← centralizado →
```

| Propriedade | Valor |
|---|---|
| Formato | Círculo |
| Tamanho | 48×48 |
| Cor de fundo | `#9C27B0` (roxo) |
| Cor do ícone | `#FFFFFF` (branco) |
| Ícone | `Feather` `chevron-up`, tamanho 24 |
| Sombra | Leve (elevação 4 / shadow) |
| Posição | `position: 'absolute'`, `bottom: 100` (um pouco acima do fim), `alignSelf: 'center'` |
| Opacidade | `Animated.Value`: 0 quando oculto, 1 quando visível |
| Animação | Fade in/out ao cruzar o threshold |
| Comportamento | `onPress` → `scrollTo({ y: 0, animated: true })` ou `scrollToOffset({ offset: 0, animated: true })` |

### Comportamento

```
[scrollPosition < threshold] → botão oculto (opacity 0, pointerEvents none)
[scrollPosition >= threshold] → botão visível (opacity 1, pointerEvents auto)
[onPress] → scroll suave ao topo
```

### Integração nas Telas

Cada tela precisa:

1. Importar `useRef` (se já não tiver) e o componente
2. Criar `const scrollRef = useRef<ScrollView>(null)` (ou `FlatList`)
3. Atribuir `ref={scrollRef}` ao ScrollView/FlatList
4. Adicionar `onScroll` handler com `Animated.event` ou `onScroll` para capturar `contentOffset.y`
5. Adicionar estado `scrollY` (pode ser `useRef(new Animated.Value(0)).current` ou estado comum)
6. Renderizar `<ScrollToTopButton>` no final do JSX, dentro do container principal

## 2. Ajuste de Cor — Campo de Data (ProductEditScreen.tsx)

### Linha 315-326 (átual)

```tsx
<Animated.View style={[styles.stockFieldContainer, {
  borderColor: h.isDarkMode ? '#4A4A54' : '#9C27B0',
  backgroundColor: h.isDarkMode ? '#2C2C36' : '#F5E6FF',
  ...
}]}>
  <Feather name="calendar" size={16} color={h.isDarkMode ? '#FF9800' : '#9C27B0'} ... />
  <Text style={{ color: h.promoStartAt
    ? (h.isDarkMode ? '#FF9800' : '#9C27B0')
    : (h.isDarkMode ? 'rgba(255,152,0,0.5)' : 'rgba(156,39,176,0.5)')
  }}>
    ...
  </Text>
</Animated.View>
```

### Depois da alteração

```tsx
<Animated.View style={[styles.stockFieldContainer, {
  borderColor: '#9C27B0',
  backgroundColor: h.isDarkMode ? '#2C1D3D' : '#F5E6FF',
  ...
}]}>
  <Feather name="calendar" size={16} color="#9C27B0" ... />
  <Text style={{ color: h.promoStartAt
    ? '#9C27B0'
    : 'rgba(156,39,176,0.5)'
  }}>
    ...
  </Text>
</Animated.View>
```

### Mudanças Específicas

| Local | Antes (dark mode) | Depois (dark mode) |
|---|---|---|
| `borderColor` | `h.isDarkMode ? '#4A4A54' : '#9C27B0'` | `'#9C27B0'` (fixo) |
| `backgroundColor` | `h.isDarkMode ? '#2C2C36' : '#F5E6FF'` | `h.isDarkMode ? '#2C1D3D' : '#F5E6FF'` |
| Icon color | `h.isDarkMode ? '#FF9800' : '#9C27B0'` | `'#9C27B0'` (fixo) |
| Text color (com data) | `h.isDarkMode ? '#FF9800' : '#9C27B0'` | `'#9C27B0'` (fixo) |
| Text color placeholder | `h.isDarkMode ? 'rgba(255,152,0,0.5)' : 'rgba(156,39,176,0.5)'` | `'rgba(156,39,176,0.5)'` (fixo) |
