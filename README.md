# Template — Academia premium (preto e vermelho)

Site estático de página única, pronto para personalizar e publicar em qualquer hospedagem
(Netlify, Vercel, GitHub Pages, cPanel etc.). Abra `index.html` no navegador para ver.

## Estrutura
- `index.html` — conteúdo e SEO (title, description, Open Graph, JSON-LD `ExerciseGym`)
- `assets/css/style.css` — identidade visual; cores e fontes nos tokens do topo (`:root`)
- `assets/js/main.js` — menu mobile, navegação ativa, animações de entrada, prévia das
  modalidades, alternância de planos, máscara de telefone e validação dos formulários

## Personalização rápida
1. Busque por `Sua Marca`, `seudominio`, `(00) 00000-0000` e `Rua da sua academia` e troque pelos dados reais.
2. Cores: altere `--red`, `--red-hot` e `--red-deep` em `style.css`.
3. Grade de horários: objeto `GRADE` no `main.js` ([horário, aula, duração/local, nível 1–3]).
4. Preços: atributo `data-base` de cada plano (valor mensal); descontos em `data-discount` nos botões de período.
5. Formulários: preencha `CONFIG` no topo do `main.js` (`whatsapp` com DDI+DDD, ex. `5511999999999`, e/ou `email`).
   Os formulários passam a abrir uma conversa de WhatsApp (wa.me) ou o e-mail já preenchidos. Grátis e sem API.
6. Fotos: imagens do Unsplash carregadas direto do CDN (licença Unsplash, uso comercial livre).
   Para produção, o ideal é baixar, converter para WebP/AVIF e servir localmente.

## Créditos de imagem
Fotos de Unsplash (unsplash.com). IDs utilizados estão nas URLs `images.unsplash.com/photo-...`.

## Deploy
Repositório ligado ao Vercel: cada push na branch `main` publica automaticamente em https://sua-marca-academia.vercel.app
