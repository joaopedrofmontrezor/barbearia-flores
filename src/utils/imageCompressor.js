/**
 * UTILITÁRIO DE COMPRESSÃO DE IMAGENS NO CLIENT-SIDE (HTML5 CANVAS)
 * 
 * Este utilitário resolve problemas críticos de infraestrutura, performance e limite de armazenamento:
 * 1. Redução de Bandwidth: Envia arquivos significativamente menores para o servidor/Firebase.
 * 2. Prevenção de Estouro de Cota: Evita o bloqueio da aplicação por upload de imagens em Base64
 *    gigantes diretamente no Firestore (limite de 1MB por documento) ou estouro do LocalStorage (limite 5MB total).
 * 3. Otimização de Carregamento: Garante que as imagens do portfólio e equipe carreguem instantaneamente no mobile.
 * 
 * @param {File} file - Objeto original do arquivo capturado do input do usuário.
 * @param {number} maxWidth - Largura máxima permitida para a imagem final comprimida (default: 800px).
 * @param {number} maxHeight - Altura máxima permitida para a imagem final comprimida (default: 800px).
 * @param {number} quality - Fator de qualidade da imagem, variando de 0.0 a 1.0 (default: 0.7).
 * @returns {Promise<File>} - Promise que se resolve retornando um novo objeto File comprimido e redimensionado.
 */
export const compressImage = (file, maxWidth = 800, maxHeight = 800, quality = 0.7) => {
  return new Promise((resolve) => {
    // Validação defensiva: se não houver arquivo, tipo incompatível ou ambiente SSR, ignora e retorna o arquivo original.
    if (typeof window === 'undefined' || !file || !file.type || !file.type.startsWith('image/')) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // --- CÁLCULO DE PROPORÇÃO DA IMAGEM (ASPECT RATIO SCALE) ---
        // Mantém a proporção original do corte sem achatar ou esticar a imagem
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback seguro caso o contexto do canvas 2D falhe no navegador do usuário
          resolve(file);
          return;
        }

        // Desenha a imagem no canvas. O motor interno do navegador executa downsampling bilinear
        ctx.drawImage(img, 0, 0, width, height);

        // Converte o canvas para Blob binário com o tipo MIME original e qualidade ajustada
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            
            // Instancia o novo File mantendo os metadados originais (nome, data de modificação)
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            
            // Log corporativo para auditoria de desempenho
            console.log(
              `⚡ [ImageCompressor] Imagem "${file.name}" comprimida de ${(file.size / 1024).toFixed(1)}KB para ${(compressedFile.size / 1024).toFixed(1)}KB (${(((file.size - compressedFile.size) / file.size) * 100).toFixed(0)}% de economia).`
            );
            resolve(compressedFile);
          },
          file.type,
          quality
        );
      };

      img.onerror = (err) => {
        console.warn("⚠️ [ImageCompressor] Erro ao carregar elemento Image. Retornando arquivo original.", err);
        resolve(file);
      };
    };

    reader.onerror = (err) => {
      console.warn("⚠️ [ImageCompressor] Erro ao ler bytes do arquivo. Retornando arquivo original.", err);
      resolve(file);
    };
  });
};

