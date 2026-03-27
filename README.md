# Churrasco Drinks Tracker

Versão com 3 páginas separadas:

- `public.html` → quiosque/tablet compartilhado
- `private.html` → uso individual no celular
- `admin.html` → totais, rateio e resumo final

## Fluxo

### Público
- nomes em botões
- bebidas em botões grandes
- feedback ao registrar
- volta automática para a tela inicial
- botão `Done` para voltar rápido

### Privado
- nomes em botões
- registro com contador por bebida (`+1` / `-1`)
- `Done` mantém a pessoa no fluxo atual
- resumo por pessoa selecionada

### Admin
- custo por unidade
- arredondamento em quarters
- totais por bebida
- totais por pessoa
- copiar resumo final

## Observação técnica

Os dados são compartilhados via `localStorage` do navegador.
Isso funciona bem quando o mesmo navegador/dispositivo usa as páginas.
Se no futuro você quiser sincronizar múltiplos celulares diferentes em tempo real, aí vale plugar um backend leve (ex: Supabase/Firebase).
