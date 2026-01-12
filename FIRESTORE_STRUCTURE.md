# Estrutura do Firestore - Conecta UFOP API

Este documento mapeia todas as collections, atributos e subcollections utilizadas no Firebase Firestore.

## Collections

### 1. `maps` / `maps_production`

**Descrição**: Armazena mapas de eventos principais.

**Ambiente**:
- **dev**: `maps`
- **prod**: `maps_production`

**Atributos**:

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `eventId` | string | Sim | ID único do evento |
| `html` | string | Sim | HTML completo do mapa do evento |
| `mapImageUrl` | string | Sim | URL da imagem do mapa |
| `markedPositions` | object | Não | Objeto com posições marcadas |
| | | | - **Chave**: ID da posição (string) |
| | | | - **Valor**: Array de strings (IDs de usuários/reservas) |

**Exemplo de `markedPositions`**:
```json
{
  "435": ["01", "02"],
  "436": ["03"],
  "437": ["04", "05", "06"]
}
```

**Subcollections**:

#### `sectorMaps`

**Descrição**: Subcollection que armazena mapas específicos de setores dentro de um evento.

**Caminho**: `maps/{eventDocId}/sectorMaps/{sectorId}` ou `maps_production/{eventDocId}/sectorMaps/{sectorId}`

**Atributos**:

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `html` | string | Sim | HTML do mapa do setor específico |
| `mapImageUrl` | string | Sim | URL da imagem do mapa do setor |

---

### 2. `preBookings` / `preBookings_production`

**Descrição**: Armazena pré-reservas de posições nos mapas.

**Ambiente**:
- **dev**: `preBookings`
- **prod**: `preBookings_production`

**Atributos**:

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `eventId` | string | Sim | ID do evento relacionado |
| `name` | string | Sim | Nome completo do cliente |
| `cpf` | string | Sim | CPF do cliente |
| `phone` | string | Sim | Telefone do cliente |
| `positions` | array[string] | Sim | Array de IDs das posições reservadas (mínimo 1) |
| `active` | boolean | Sim | Status ativo/inativo da pré-reserva |

**Nota**: Ao criar uma pré-reserva, o campo `active` é automaticamente definido como `true`.

---

### 3. `config`

**Descrição**: Collection para armazenar configurações e textos do sistema.

**Ambiente**: Único (não varia entre dev/prod)

**Documentos**:

#### `terms`

**Descrição**: Documento que armazena os termos de uso do sistema.

**Caminho**: `config/terms`

**Atributos**:

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `value` | string | Sim | HTML completo dos termos de uso |

#### `privacy_police`

**Descrição**: Documento que armazena a política de privacidade do sistema.

**Caminho**: `config/privacy_police`

**Atributos**:

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `value` | string | Sim | HTML completo da política de privacidade |

**Subcollections**: Nenhuma

---

### 4. `meta`

**Descrição**: Collection para armazenar metadados do sistema.

**Ambiente**: Único (não varia entre dev/prod)

**Documentos**:

#### `migrations`

**Descrição**: Documento único que controla quais migrações já foram executadas.

**Caminho**: `meta/migrations`

**Atributos**:

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `executed` | array[string] | Não | Array com nomes das funções de migração já executadas |

**Nota**: Este documento é criado automaticamente quando a primeira migração é executada.  

---

