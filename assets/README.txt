Assets extraídos do Entregador_PDA (7).html

images/background.jpg: imagem JPEG embutida no HTML, extraída sem recompressão.
models/*.obj + *.mtl: modelos 3D convertidos do formato compacto original para Wavefront OBJ com materiais MTL.
data/character_sprite_data.bin e data/shadow_data.bin: blocos de dados auxiliares extraídos em bytes. São formatos internos do código original; não são imagens/modelos padrão.

Os arquivos foram extraídos/convertidos, mas o HTML/JavaScript original ainda precisa ser alterado para carregar esses caminhos externos. Os modelos OBJ/MTL não são usados automaticamente pelo renderizador 3D personalizado atual.
