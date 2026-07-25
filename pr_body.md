## Modificações

- Recompensa por auditoria de submissões reduzida de 10 para 3.
- A recompensa só é aplicada quando o status da submissão é `APPROVED`.
- A descrição da transação de recompensa agora inclui o título da atividade.

## Novo endpoint

Para suportar a visualização no histórico de perfil, o seguinte endpoint foi adicionado:

- **Rota:** `GET /profile-portfolio/:profileId/moderation-history`
- **Método HTTP:** `GET`
- **Shape da resposta (JSON):**

```json
[
  {
    "id": "uuid",
    "amount": 3,
    "description": "Revisão de submissão: Nome da Atividade",
    "createdAt": "2026-07-25T14:00:00.000Z"
  }
]
```
