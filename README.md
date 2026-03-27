# Churrasco Drinks Tracker

Mini web app mobile-first para registrar consumo de bebidas por clique.

## Como usar

1. Abra `index.html` no navegador.
2. Escolha o modo:
   - `Privado (celular)` para uso individual
   - `Público (tablet)` para uso compartilhado perto das bebidas
3. No modo privado, selecione o nome/casal no seletor.
4. No modo público, toque no nome em botão grande.
5. Clique em `+1` na bebida correspondente.
6. Use `-1` para corrigir.
7. No modo público, toque em `Done` quando terminar para voltar à lista de nomes.
8. Abra `Admin` para ver totais e calcular o repasse.
9. Informe o custo por unidade em libras.
10. O sistema arredonda para cima no quarter escolhido.
11. Clique em `Copiar resumo` para gerar o texto final.

## Regras implementadas

- Casais contam juntos.
- Contagem por unidade.
- Rateio simples por unidade.
- Arredondamento para cima em quarters (padrão: £0.25).
- Dados salvos no `localStorage` do navegador.

## Lista atual

Participantes:
- Eu
- Fe e Umit
- Filipi e Isa
- Thi e Ju
- Gustavo
- Shura
- Cici
- Riley
- Aycan
- Enis
- Dove
- Amgad
- Larissa
- Ana

Bebidas:
- Beer
- Caipirinha
- Batida de morango
- Jagermeister
- Tequila Rose
- Aperol Spritz
- Breezer Watermelon
