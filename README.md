# Ateliê aberto

Protótipo de um arquivo editorial sobre arte, história da arte e moda.

## Requisitos

- Node.js e npm
- Python 3.10 ou superior
- Uma chave da API Gemini (`GEMINI_API_KEY`) para gerar conexões entre matérias

## Frontend

```bash
npm install
npm run dev
```

O frontend consulta a API local em `http://localhost:8000`.

## Backend de scraping

Na raiz do projeto, crie e ative um ambiente virtual e instale as dependências:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

`google-genai`, usado pela API, já é instalado junto com as demais dependências.

Edite `.env` e preencha `GEMINI_API_KEY` para habilitar a geração de conexões. Em seguida, execute os scrapers:

```bash
python main.py
```

O comando coleta DailyArt, The Art Newspaper, Google Arts & Culture e Vogue, salvando os resultados em `data/raw/`. A limpeza e a persistência no banco ainda não fazem parte desse fluxo. Antes de coletar uma fonte, verifique `robots.txt`, os termos de uso e a licença dos dados e imagens.

## API local

Com o ambiente virtual ativo, inicie a API:

```powershell
uvicorn api:app --reload
```

A API ficará disponível em `http://localhost:8000`. Consulte `http://localhost:8000/docs` para ver a documentação interativa. Em outro terminal, execute `npm run dev` para abrir o frontend.