Projeto Entregador PDA — recursos externos

Estrutura:
- index.html: página principal
- css/style.css: estilos
- js/main.js: lógica do autômato, renderização e carregamento dos recursos
- assets/images/background.jpg: imagem de fundo
- assets/models/*.obj e *.mtl: modelos 3D e materiais em texto
- assets/data/squirrel_mesh.json: geometria do esquilo em JSON
- assets/data/shadow_weights.json: pesos de animação/sombra em JSON


Execute a partir desta pasta com um servidor HTTP local (o fetch não funciona de forma confiável com file://):
  python3 -m http.server 8000
Depois abra http://localhost:8000
