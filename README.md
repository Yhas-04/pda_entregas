
# Projeto PDA

## Modos de execução

- **Modo Restrito PDA:** segue o autômato. Se não existir uma transição válida para o símbolo, a sequência é rejeitada.
- **Modo Livre:** para não atrapalhar a jogabilidade, permite passar "por cima" de alguns pontos do mapa sem possuir o símbolo necessário no topo da pilha.

## Como jogar

- Com **W, A, S e D**, passe pelos pontos de coleta, pelas casas e pelos objetivos para executar os símbolos da sequência.
- No mapa:
  - Os círculos em azul (letras minúsculas) representam os restaurantes.
  - Os círculos em verde (letras maiúsculas) representam as casas dos clientes.
  - O círculo rosa (m) é a poupança, onde se coloca as moedas
  - Os quadrados em laranja representam os pedágios.
  - O quadrado em amarelo representa o portão.
- Os pedidos devem ser retirados nos restaurantes e entregues nas casas correspondentes.
- Também é possível digitar uma sequência. Os símbolos devem ser escritos juntos, sem espaços.
- Clique em **Reiniciar** para voltar ao início e tentar outra sequência.

## Aceitação

O roteiro é aceito se a pilha chegar a **q6** e a entrada acabar. Isso obriga a:

- Retirar e entregar os 4 pedidos (todo ticket precisa ser usado).
- Cumprir os 3 objetivos (G, P, E).
- Depositar exatamente 2 moedas na poupança.

## Tutorial

Para a sequência `aAPbBmdGcCmDE`:

1. **a** – Vá até o restaurante "a" e retire o pedido.
2. **A** – Vá até a casa "A" e entregue o pedido. Você receberá uma moeda.
3. **P** – Libere o Pedágio 1.
4. **b** – Vá até o restaurante "b" e retire o pedido.
5. **B** – Vá até a casa "B" e entregue o pedido. Você receberá uma moeda.
6. **m** – Deposite uma moeda na poupança.
7. **d** – Vá até o restaurante "d" e retire o pedido.
8. **G** – Abra o portão.
9. **c** – Vá até o restaurante "c" e retire o pedido.
10. **C** – Vá até a casa "C" e entregue o pedido. Você receberá uma moeda.
11. **m** – Deposite a segunda moeda na poupança.
12. **D** – Vá até a casa "D" e entregue o pedido. Você receberá uma moeda.
13. **E** – Libere o Pedágio 2. **– ACEITO!**

## Alfabeto

| Símbolo | Significado |
|---|---|
| `a` | Pegar pedido no restaurante "a" |
| `b` | Pegar pedido no restaurante "b" |
| `c` | Pegar pedido no restaurante "c" |
| `d` | Pegar pedido no restaurante "d" |
| `A` | Entregar pedido na casa do cliente "A". A cada entrega, você ganha uma moeda. |
| `B` | Entregar pedido na casa do cliente "B" |
| `C` | Entregar pedido na casa do cliente "C" |
| `D` | Entregar pedido na casa do cliente "D" |
| `m` | Depositar moeda na poupança |
| `G` | Abrir portão |
| `P` | Liberar Pedágio 1 |
| `E` | Liberar Pedágio 2 |

## Alfabeto da pilha

| Símbolo | Significado |
|---|---|
| `Z` | Fundo/início da pilha |
| `A` | Pedido "A" |
| `B` | Pedido "B" |
| `C` | Pedido "C" |
| `D` | Pedido "D" |
| `K` | Chave que abre o portão (G) |
| `M` | Moedas |
| `V` | Ticket para poder retirar o pedido no Restaurante A ("a") |
| `T` | Ticket para o Restaurante B ("b") |
| `U` | Ticket para o Restaurante C ("c") |
| `W` | Ticket para o Restaurante D ("d") |
| `λ` | Vazio/nada |

## Sobre o PDA (arquivo JFF)

São 8 estados. A mudança entre os estados "principais" (q0, q1, q4, q5, q3 e q2) ocorre quando um objetivo é alcançado.

### Progresso

- **q0:** início.
- **q1:** portão aberto.
- **q2:** Pedágio 1 aberto.
- **q4:** portão e Pedágio 1 abertos.
- **q3:** pedágios 1 e 2 abertos (portão ainda fechado).
- **q5:** tudo aberto.
- **q7:** empilha os tickets V e W em uma das duas ordens.
- **q6:** final.

Esses objetivos (obrigatórios para a conclusão do jogo) são:

- Abrir o portão (G).
- Abrir o Pedágio 1 (P).
- Abrir o Pedágio 2 (E).

Além dessas transições, que só ocorrem uma única vez, também é obrigatório depositar 2 moedas (metade dos seus ganhos) na poupança (m).

## Estrutura

- `index.html`: página principal.
- `css/style.css`: estilos.
- `js/main.js`: lógica do autômato, renderização e carregamento dos recursos.
- `assets/images/background.jpg`: imagem de fundo.
- `assets/models/*.obj` e `*.mtl`: modelos 3D e materiais em texto.
- `assets/data/squirrel_mesh.json`: geometria em JSON.
- `assets/data/shadow_weights.json`: pesos de animação/sombra em JSON.
