# Ateliê aberto

Protótipo de um arquivo editorial sobre arte, história da arte e moda.

## Frontend

```bash
npm run dev
```

O frontend usa dados demonstrativos e imagens de referência até uma API ou uma exportação processada ser conectada.

## Backend de scraping

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python main.py
```

Os scrapers em `scrapers/` coletam DailyArt e Vogue na mesma execução. Antes de coletar uma fonte, verifique `robots.txt`, os termos de uso e a licença dos dados e imagens. O fluxo recomendado é: coletar em `data/raw`, limpar em `data/processed` e só então persistir no banco.

## API local

Com o ambiente virtual ativo, rode:

```powershell
uvicorn api:app --reload
```

A API ficará disponível em `http://localhost:8000`. Consulte `http://localhost:8000/docs` para ver a documentação interativa. Em outro terminal, execute `npm.cmd run dev` para abrir o frontend.