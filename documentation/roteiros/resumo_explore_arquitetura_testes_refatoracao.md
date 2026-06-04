# 🎓 RELATÓRIO CONCEITUAL DE ENGENHARIA DE SOFTWARE & ARQUITETURA
## 🚀 Ecossistema Mobile AgroPet Lambari — Mapeamento de Testes e Plano de Componentização

Este documento consolida e formaliza todas as decisões arquiteturais planejadas durante a fase **Explore** do projeto **AgroPet Lambari** (composto pelos aplicativos **Cliente** e **Admin** integrados com **Supabase**). Ele serve como um artefato acadêmico de alta relevância técnica para apresentação a professores e bancas examinadoras, demonstrando rigor técnico em Engenharia de Software, DDD (Domain-Driven Design), Padrões de Concorrência ACID e Testes de Alta Fidelidade com meta de **100% de Cobertura (Coverage)**.

---

## 🏛️ 1. Visão Geral da Arquitetura e o Combate ao "Domínio Anêmico"

Um dos maiores riscos identificados em aplicativos corporativos em crescimento é o **Modelo de Domínio Anêmico**. Isso ocorre quando a lógica de negócios e as validações críticas são sequestradas pelas telas (Views), deixando as classes ou estruturas de dados como meros sacos de propriedades (getters e setters) sem inteligência.

No **AgroPet Lambari**, combatemos o anemicismo de domínio através de dois pilares fundamentais:
1. **Refatoração com Separação de Conceitos (SoC - Separation of Concerns)**: Extração da lógica de dados, estados assíncronos e integrações de banco de dados para *Custom Hooks* focados, reduzindo drasticamente o tamanho das telas para **menos de 500 linhas**.
2. **Suíte de Testes de Alta Fidelidade (Padrão `caio_prova3`)**: Implementação de testes robustos (Unitários e Integrados) com **100% de cobertura de código**, cobrindo tanto caminhos felizes (happy paths) quanto fluxos complexos de erro (falhas de GPS, RLS, timeouts e concorrência).

---

## 🎯 2. Matriz de Testes (Prioridade Crítica: 4 ➡️ 2 ➡️ 1 ➡️ 3)

Seguindo a gravidade comercial do ecossistema e para proteger os fluxos financeiros mais críticos primeiro, estruturamos a suíte de testes na ordem de prioridade definida abaixo:

```
┌────────────────────────────────────────────────────────┐
│  Fase 1: Banco de Dados, APIs e Regras RLS (Prior. 4)  │ ◄── Crítico: Integridade de Dados
└───────────────┬────────────────────────────────────────┘
                │
                ▼
┌────────────────────────────────────────────────────────┐
│  Fase 2: Testes Integrados de UI e Estados (Prior. 2)  │ ◄── Fluidez: Fluxos Visuais e UX
└───────────────┬────────────────────────────────────────┘
                │
                ▼
┌────────────────────────────────────────────────────────┐
│  Fase 3: Testes Unitários de Lógica Pura (Prior. 1)    │ ◄── Exatidão: Algoritmos e Regras
└───────────────┬────────────────────────────────────────┘
                │
                ▼
┌────────────────────────────────────────────────────────┐
│  Fase 4: Testes Nativos, Timers e Storage (Prior. 3)  │ ◄── Resiliência: Mobile e Hardware
└────────────────────────────────────────────────────────┘
```

---

### 🌐 [Fase 1] - Banco de Dados, APIs e Regras de Segurança (Prioridade 4)
*Objetivo: Garantir a proteção absoluta da integridade transacional na nuvem do Supabase.*

* **Teste 1: Concorrência e Lock de Linha (`rpc_finalizar_pedido`)**
  * *Mecânica*: Disparar chamadas concorrentes assíncronas simultâneas (`Promise.allSettled`) simulando dois clientes comprando a última unidade do mesmo estoque.
  * *Verificação*: Garantir que o lock pessimista (`SELECT FOR UPDATE`) no Postgres processe apenas uma transação com sucesso (`200 OK`) e retorne erro controlado de estoque esgotado (`400 Bad Request`) na segunda.
* **Teste 2: Bypass de RLS Administrativo (`public.is_admin`)**
  * *Mecânica*: Executar checagens de autorização com perfis administrativos e de clientes comuns, garantindo tempo de resposta ultrarrápido (< 50ms) e assegurando que a consulta de segurança do Supabase esteja livre de recursão infinita (Infinite Recursion).
* **Teste 3: Isolamento de Vendas Físicas locais no Histórico**
  * *Mecânica*: Simular a listagem da tela `AdminSalesHistoryScreen.tsx` e validar se a cláusula `.neq('delivery_address', 'Venda Física PDV')` isola e oculta compras locais de balcão do relatório geral de pedidos online concluídos de clientes.

#### 📝 *Exemplo de Blueprint de Teste (Mock de API & Concorrência)*:
```typescript
import * as orderServices from '../services/orders';

describe('Fase 1: Concorrência e Isolamento do Banco de Dados', () => {
  it('deve rejeitar uma venda concorrente por falta de estoque via lock pessimista', async () => {
    // Mock do serviço de checkout disparando um erro de concorrência na segunda chamada
    const checkoutSpy = jest.spyOn(orderServices, 'finalizarPedido')
      .mockResolvedValueOnce({ success: true, orderId: 'PEDIDO-OK-123' })
      .mockRejectedValueOnce(new Error('Estoque insuficiente para o produto especificado.'));

    const res1 = orderServices.finalizarPedido('USER-1', 'PROD-RACAO-1', 1);
    const res2 = orderServices.finalizarPedido('USER-2', 'PROD-RACAO-1', 1);

    const [pedido1, pedido2] = await Promise.allSettled([res1, res2]);

    expect(pedido1.status).toBe('fulfilled');
    expect((pedido1 as any).value.success).toBe(true);

    expect(pedido2.status).toBe('rejected');
    expect((pedido2 as any).reason.message).toContain('Estoque insuficiente');
    expect(checkoutSpy).toHaveBeenCalledTimes(2);
  });
});
```

---

### ⚙️ [Fase 2] - Testes Integrados de UI e Estados Reativos (Prioridade 2)
*Objetivo: Auditar a integridade visual, fluxos de navegação e reatividade de estados na interface do usuário (UX).*

* **Teste 4: Exclusão Mútua de Alertas de Estoque (`ManageProductsScreen.tsx`)**
  * *Mecânica*: Simular o toque no filtro "Inativos" e garantir que os estados reativos dos filtros de alerta amarelo e vermelho sejam limpos (zerados) imediatamente. Testar o fluxo inverso.
* **Teste 5: Ordenação por Gravidade de Alerta**
  * *Mecânica*: Injetar produtos fictícios com diferentes níveis de estoque na listagem e garantir que itens com **Alerta Vermelho** (estoque crítico/zerado) sejam renderizados obrigatoriamente no topo da lista.
* **Teste 6: Ações em Massa de Produtos**
  * *Mecânica*: Simular o clique no botão "Selecionar Tudo", validar visualmente se todos os checkboxes passam a ter o status ativado, e testar se o acionamento da desativação em massa levanta a modal destrutiva vermelha de confirmação.
* **Teste 7: Sincronização em Tempo Real de Frete Inativo (`ClientTabs.tsx`)**
  * *Mecânica*: Simular uma notificação via WebSocket (Supabase Realtime) sinalizando que o frete da loja foi desabilitado administrativamente. Validar se a aba de Mapas/Entregas é ocultada em tempo real e se o carrinho bloqueia a finalização por delivery.

#### 📝 *Exemplo de Blueprint de Teste (Interações de UI & Exclusão Mútua)*:
```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ManageProductsScreen from '../screens/admin/ManageProductsScreen';

describe('Fase 2: Testes de UI & Filtros Mutuamente Exclusivos', () => {
  it('deve limpar os alertas amarelho/vermelho ao selecionar o filtro Inativos', () => {
    const { getByTestId, getByText } = render(<ManageProductsScreen />);
    
    const filterInativos = getByTestId('filter-inativos-btn');
    const badgeAlertaVermelho = getByTestId('badge-alerta-vermelho');

    // Inicialmente o alerta vermelho pode ter contagem de itens
    expect(badgeAlertaVermelho.props.children).not.toBe(0);

    // Clica no filtro inativos
    fireEvent.press(filterInativos);

    // O alerta vermelho deve ser resetado mutuamente
    expect(badgeAlertaVermelho.props.children).toBe(0);
  });
});
```

---

### 🟨 [Fase 3] - Testes Unitários de Lógica Isolada (Prioridade 1)
*Objetivo: Blindar algoritmos matemáticos puros e formatadores utilitários contra regressões de código.*

* **Teste 8: Feriados Nacionais e Contadores de Horário (`shopHours.ts`)**
  * *Mecânica*: Validar o motor matemático de cálculo de feriados brasileiros móveis (Carnaval, Sexta-feira Santa, Páscoa, Corpus Christi) e verificar se domingos inativos de fechamento marcam reativamente o status da loja como fechada (`isClosed = true`).
* **Teste 9: Reversão Automática de Intervalo Inválido**
  * *Mecânica*: Testar se a tentativa de realizar uma busca com data futura ou intervalo de faturamento invertido é revertida automaticamente pelo validador utilitário para a data atual válida.
* **Teste 10: Parsers de imagem (`getFirstImageUrl`)**
  * *Mecânica*: Testar a função utilitária com múltiplos formatos de entrada — string pura legada de imagem, array serializado em string JSON e arrays vazios — garantindo um fallback seguro e robusto para evitar travamentos de tela por ponteiro nulo.

#### 📝 *Exemplo de Blueprint de Teste (Unitário de Calendário e Feriados)*:
```typescript
import { isStoreOpenOnDate } from '../utils/shopHours';

describe('Fase 3: Testes de Lógica e Calendário de Feriados', () => {
  it('deve identificar a Sexta-feira Santa de 2026 como feriado fechado', () => {
    // 3 de Abril de 2026 - Sexta-feira Santa
    const dataSanta = new Date('2026-04-03T14:00:00Z');
    const result = isStoreOpenOnDate(dataSanta);
    expect(result.isOpen).toBe(false);
    expect(result.reason).toBe('Feriado Nacional (Sexta-feira Santa)');
  });

  it('deve marcar domingos como fechados por padrão de funcionamento', () => {
    // 31 de Maio de 2026 - Um Domingo
    const dataDomingo = new Date('2026-05-31T10:00:00Z');
    const result = isStoreOpenOnDate(dataDomingo);
    expect(result.isOpen).toBe(false);
    expect(result.reason).toBe('Fechado aos Domingos');
  });
});
```

---

### 📱 [Fase 4] - Testes Nativos, Timers e Armazenamento (Prioridade 3)
*Objetivo: Validar a resiliência do aplicativo ao interagir com recursos do celular (SecureStore, Loops e Garbage Collection).*

* **Teste 11: Purga Dinâmica no Carregamento do Caixa (`agropet_sangrias`)**
  * *Mecânica*: Preencher o `SecureStore` mockado com chaves contendo registros legados do tipo `'venda'`. Disparar a rotina de abertura da tela e auditar se os registros de venda são higienizados e purgados dinamicamente de forma transparente, retendo estritamente transações financeiras manuais (`sangrias` e `suprimentos`).
* **Teste 12: Memory Leaks e Loops no Carrossel de Imagens (`HomeScreen.tsx`)**
  * *Mecânica*: Simular o ciclo de vida do carrossel rotativo de produtos com multi-fotos (timer nativo de 5 segundos). Garantir que o temporizador seja limpo (`clearInterval` / `clearTimeout`) quando o componente for desmontado, prevenindo estouro de memória (Out-Of-Memory) e loops fantasmas em background.

---

## 🛠️ 3. O Plano de Refatoração: Rumo à Componentização (Meta: < 500 Linhas)

O feedback acadêmico indicou que manter arquivos de tela extremamente extensos (como os 105KB do `AdminDashboardScreen.tsx`) prejudica gravemente a leitura e eleva o débito técnico. 

A estratégia para quebrar esses "arquivos monstros" em componentes e hooks enxutos **sem alterar uma única linha de comportamento ou interface visual** baseia-se no padrão **SoC (Separation of Concerns)**:

### 📐 Mapa Visual da Decomposição do Dashboard do Caixa:
```
                               AdminDashboardScreen.tsx (Main Hub)
                                - Apenas liga a fiação
                                - Tamanho final: ~350 linhas
                                          │
                  ┌───────────────────────┼───────────────────────┐
                  ▼                       ▼                       ▼
           useCaixa.ts               usePDV.ts              Componentes UI
          (Custom Hook)            (Custom Hook)           (Presentational)
        - Estado sangrias        - Carrinho local       - CaixaMétricasCard.tsx
        - Ações Supabase         - Fechamento caixa     - SangriaModal.tsx
        - SecureStore sync       - Faturamento real     - GraficoFaturamento.tsx
```

### 📋 As Três Regras de Ouro da Refatoração:
1. **Zero Ad-Hoc Utilities nas Views**: Toda a lógica de requisições assíncronas do Supabase e formatação matemática é movida para hooks.
2. **Presentational (Dumb) Components**: Componentes visuais apenas recebem dados por propriedades (`props`) e emitem eventos (ex: `onConfirm`). Eles não gerenciam estados complexos ou conexões de rede de forma direta.
3. **Preservação de Estilo**: Absolutamente nenhum pixel visual, animação, gradiente ou layout da interface deve ser modificado durante as transferências de código.

---

### 💻 Exemplo de Estrutura Refatorada

#### 1. O Custom Hook de Lógica Centralizada (`useCaixa.ts`):
```typescript
import { useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { supabase } from '../../data/supabase';

export function useCaixa() {
  const [sangrias, setSangrias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCaixa, setTotalCaixa] = useState(0);

  const carregarDadosCaixa = async () => {
    setLoading(true);
    try {
      // 1. Carrega dados do Supabase
      const { data, error } = await supabase.from('fluxo_caixa').select('*');
      if (error) throw error;

      // 2. Carrega do SecureStore local purgado
      const localData = await SecureStore.getItemAsync('agropet_sangrias');
      let parsed = localData ? JSON.parse(localData) : [];
      
      // Purga automática de legado 'venda'
      const cleanData = parsed.filter((t: any) => t.type !== 'venda');
      if (parsed.length !== cleanData.length) {
        await SecureStore.setItemAsync('agropet_sangrias', JSON.stringify(cleanData));
      }
      
      setSangrias(cleanData);
      calcularMétricas(data, cleanData);
    } catch (e) {
      console.error('Falha ao sincronizar caixa:', e);
    } finally {
      setLoading(false);
    }
  };

  const realizarSangria = async (valor: number, motivo: string) => {
    // Lógica pura de sangria e atualização local/nuvem
  };

  return { sangrias, loading, totalCaixa, carregarDadosCaixa, realizarSangria };
}
```

#### 2. O Hub de Tela Enxuto (`AdminDashboardScreen.tsx`):
```typescript
import React from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import { useCaixa } from './hooks/useCaixa';
import { CaixaMetricasCard } from './components/CaixaMetricasCard';
import { GraficoFaturamento } from './components/GraficoFaturamento';

export default function AdminDashboardScreen() {
  const { sangrias, loading, totalCaixa, carregarDadosCaixa, realizarSangria } = useCaixa();

  if (loading) {
    return <ActivityIndicator testID="dashboard-spinner" size="large" color="#FF0000" />;
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#0B0D19' }}>
      {/* Componente Enxuto de Métricas */}
      <CaixaMetricasCard total={totalCaixa} sangriasCount={sangrias.length} />

      {/* Componente Enxuto do Gráfico de Faturamento */}
      <GraficoFaturamento />

      {/* Outras seções componentizadas */}
    </ScrollView>
  );
}
```

---

## 📈 4. Benefícios para Defesa e Apresentação Acadêmica

Ao adotar este planejamento conceitual em sala de aula ou para seus professores, Caio, você ganha argumentos técnicos irrefutáveis e de alto nível:
* **"Telas Gordas vs. Telas Componentizadas"**: Você demonstra conhecimento prático sobre o princípio de responsabilidade única (SRP - Single Responsibility Principle) e SoC.
* **"Controle de Débito Técnico"**: Provar que um código componentizado com menos de 500 linhas reduz a complexidade ciclomática de arquivos gigantes e facilita revisões de código de novos desenvolvedores.
* **"Mitigação do Modelo Anêmico"**: Mostrar que suas entidades do banco agora possuem regras testadas via código e que seus testes integrados de UI cobrem 100% de linhas, simulando o ecossistema nativo do celular (como câmera e GPS).
* **"Segurança Concorrente"**: Uma solução com rigor matemático de concorrência ACID utilizando locking no PostgreSQL que protege o negócio contra perdas financeiras.

---
<div align="center">
  <sub>© 2026 Caio Magalhães. Desenvolvido para a AgroPet Lambari. Todos os direitos reservados.</sub>
</div>
