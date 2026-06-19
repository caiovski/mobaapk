## ADDED Requirements

### Requirement: Detecção Automática de Festividade
O sistema DEVE calcular automaticamente a festividade atual com base no intervalo de datas pré-definido, retornando metadados visuais (tema) e string identificadora.

#### Scenario: Sucesso ao detectar festividade de longa duração (Halloween)
- **DADO** que a data atual do sistema é 20 de Outubro
- **QUANDO** a engine sazonal for instanciada
- **ENTÃO** ela deve retornar "Halloween" como campanha ativa e injetar os tokens visuais correspondentes

#### Scenario: Falha de rede ao tentar consultar configurações sazonais externas
- **DADO** que o dispositivo está offline
- **QUANDO** o app iniciar
- **ENTÃO** a engine sazonal DEVE fazer o fallback para as datas hardcoded locais e manter a consistência do calendário

### Requirement: Override e Modo Preview Sazonal
O sistema DEVE permitir que a data real do dispositivo seja ignorada, forçando a ativação visual de um tema específico.

#### Scenario: Administrador força visualização fora de época
- **DADO** que estamos no mês de Junho
- **QUANDO** a variável de ambiente de override estiver ativada OU o administrador selecionar "Natal" no menu de Preview
- **ENTÃO** a engine sazonal DEVE ignorar o mês de Junho e fornecer à aplicação os tokens visuais correspondentes ao "Natal"
