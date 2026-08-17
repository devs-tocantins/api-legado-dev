# Serialização (Manipulação de Saída de Dados na Rede)

O legado.dev conta com uma estrutura central super útil importada do mundo React/Angular para lidar com Retornos da API ("Serializar Carga"): A ferramenta `class-transformer` em conjunto ao NestJS formam o ecossistema perfeito no uso dos *Decoradores de Classes*.

---

## Tabela de Conteúdos <!-- omit in toc -->

- [Ocultar propriedades sensíveis ou privadas (Dados Limpos)](#ocultar-propriedades-privadas)
- [Tratamentos Estratificados (Mostrar dados sigilosos apenas para Admins)](#mostrar-propriedade-privada-para-admins)

---

## Ocultar Propriedades Privadas

Não é necessário limpar via código manualmente cada "senhas", "hash de tokens" dos seus selects e queries TypeORM em dezenas de Models/Repos. O `class-transformer` trata tudo!
Você simplesmente marca diretamente na Entidade o campo do Hash e o Rest interceptor automaticamente bloqueia de vazar nos retornos Puros (O JSON no Postman que devolve a Entity).

Use a anotação `@Exclude({ toPlainOnly: true })` na coluna sensível da sua `Entity`.

```ts
import { Exclude } from 'class-transformer';

@Entity()
export class User extends EntityRelationalHelper {
  // ..

  @Column({ nullable: true })
  @Exclude({ toPlainOnly: true }) // <-- NUNCA vai sair p/ o Request/JSON. A engine processou? Exclua.
  password: string;

  // ..
}
```

## Mostrar Propriedade Privada para Admins

Em casos raros de Auditoria em Regras de Negócios / Painel Administrativo do "GamificationProfile", você pode querer devolver dados que normalmente o Usuário Padrão nunca deve saber: Como por exemplo O E-mail Completo de Outra Pessoa na plataforma ou Hash do Access de Login. Como desviar a exclusão?

1. Force seu Controller Administrativo a injetar na chamada toda uma Regra Agrupada Global através da propriedade `@SerializeOptions({ groups: ['admin'] })`:

   ```ts
   // ...
   @SerializeOptions({
     groups: ['admin'], // Passamos o Grupo de Serialização aqui na Resposta de View Completa
   })
   @Get(':id')
   @HttpCode(HttpStatus.OK)
   findOne(@Param('id') id: string) {
     return this.usersService.findOne({ id: +id });
   }
   // ...
   ```

2. E lá no seu Módulo nativo: Injete o grupo na exclusividade e a API irá expor este dado!

   ```ts
   import { Expose } from 'class-transformer';

   @Entity()
   export class User extends EntityRelationalHelper {
     // ..

     @Column({ unique: true, nullable: true })
     @Expose({ groups: ['admin'] }) // Eu normalmente ficaria oculto, EXCETO se no "Módulo" me ativarem com 'admin'.
     email: string | null;

     // ..
   }
   ```
