Projeto PDA

Aceitação: o roteiro é aceito se a pilha chegar a q5 só com Z e a entrada acabar. Isso obriga a:
- retirar e entregar os 4 pedidos (todo ticket precisa ser usado);
- cumprir os 3 objetivos (G, P, E);
- depositar exatamente 2 moedas na poupança.


Estrutura:
- index.html: página principal
- css/style.css: estilos
- js/main.js: lógica do autômato, renderização e carregamento dos recursos
- assets/images/background.jpg: imagem de fundo
- assets/models/*.obj e *.mtl: modelos 3D e materiais em texto
- assets/data/squirrel_mesh.json: geometria em JSON
- assets/data/shadow_weights.json: pesos de animação/sombra em JSON


Execute a partir desta pasta com um servidor HTTP local (o fetch não funciona de forma confiável com file://):
  python3 -m http.server 8000
Depois abra http://localhost:8000


ALFABETO: 

a = Pegar pedido no restaurante "a"
b = Pegar pedido no restaurante "b"
c = Pegar pedido no restaurante "c"
d = Pegar pedido no restaurante "d"
A = Entregar pedido na casa do cliente "A" - A cada entrega, você ganha uma moeda
B = Entregar pedido na casa do cliente "B"
C = Entregar pedido na casa do cliente "C"
D = Entregar pedido na casa do cliente "D"
m = Depositar moeda na poupança
G = Abrir portão 
P = Liberar Pedágio 1
E = Liberar Pedágio 2

ALFABETO DA PILHA:

Z = Fundo/ Inicio da pilha
A = Pedido "A"
B = Pedido "B"
C = Pedido "C"
D = Pedido "D"
K = Chave que abre o Portão (G)
M = Moedas 
V = Ticket para poder retirar o pedido no Restaurante A "a"
T = Ticket para o Restaurante B "b" 
U = Ticket para o Restaurante C "c"
W = Ticket para o Restaurante D "d"
lambda = vazio/nada

SOBRE O PDA (arquivo jff):

São 8 estados, a mudança entre os estados "principais" (q0, q1, q4, q5, q3, q2) ocorre quando um objetivo é alcançado.

progresso:

q0 início
q1 portão aberto
q2 pedágio 1 aberto
q4 portão e pedágio 1 abertos
q3 pedágios 1 e 2 abertos (portão ainda fechado)
q5 tudo aberto.
q7 empilha os tickets V e W em uma das duas ordens
q6 Final

Esses objetivos (obrigatórios para a conclusão do jogo) são: Abrir o portão (G), abrir o Pedágio 1 (P) e abrir o Pedágio 2 (E).
Além dessas transições que só ocorrem uma única vez, também é obrigatório depositar 2 moedas (metade dos seus ganhos) na Poupança (m).


