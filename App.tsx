import { useEffect, useState } from 'react'
import './App.css'

type Story = {
  category: string
  title: string
  meta: string
  description: string
  image: string
  sourceUrl: string
  tone: string
}

type ConnectionData = {
  analysis: string
  related_titles: string[]
}

function App() {
  const [stories, setStories] = useState<Story[]>([])
  const [activeFilter, setActiveFilter] = useState('Tudo')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [selectedStory, setSelectedStory] = useState<Story | null>(null)
  const [loadingAi, setLoadingAi] = useState(false)
  const [connectionResult, setConnectionResult] = useState<ConnectionData | null>(null)

  useEffect(() => {
    fetch('http://localhost:8000/api/items')
      .then((response) => {
        if (!response.ok) throw new Error('A API ainda não está disponível.')
        return response.json()
      })
      .then((items: Array<{ title: string; category: string; description: string; image_url: string; source_url: string }>) => {
        setStories(
          items.map((item, index) => ({
            category: 'Arquivo editorial',
            title: item.title,
            meta: item.category,
            description: item.description || '',
            image: item.image_url,
            sourceUrl: item.source_url,
            tone: ['ochre', 'ink', 'rose'][index % 3],
          })),
        )
      })
      .catch((requestError: Error) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleTraceConnections(story: Story) {
    setSelectedStory(story)
    setConnectionResult(null)
    setLoadingAi(true)

    try {
      const response = await fetch('http://localhost:8000/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: story.title,
          category: story.meta,
          description: story.description,
        }),
      })

      if (!response.ok) throw new Error('Falha na API')
      const data: ConnectionData = await response.json()
      setConnectionResult(data)
    } catch {
      // Fallback inteligente: pontua afinidade por palavras-chave e cruza Arte <-> Moda
      const keywords = story.title
        .toLowerCase()
        .split(/\W+/)
        .filter((w) => w.length > 3)

      const others = stories.filter((item) => item.title !== story.title)
      const scored = others
        .map((candidate, idx) => {
          const text = `${candidate.title} ${candidate.description}`.toLowerCase()
          const wordScore = keywords.reduce((acc, word) => acc + (text.includes(word) ? 3 : 0), 0)
          const crossCategoryBonus = candidate.meta !== story.meta ? 2 : 0
          // Deslocamento determinístico baseado no título para nunca repetir os mesmos 2 itens
          const offsetTieBreaker = (idx + story.title.length) % 5
          return { candidate, score: wordScore + crossCategoryBonus + offsetTieBreaker }
        })
        .sort((a, b) => b.score - a.score)

      const related = scored.slice(0, 2).map((entry) => entry.candidate.title)

      setConnectionResult({
        analysis: `Ao analisar "${story.title}", identificamos diálogos estéticos e narrativos com outras obras do acervo — conectando referências de ${story.meta.toLowerCase()} a outras expressões da cultura visual contemporânea e histórica.`,
        related_titles: related,
      })
    } finally {
      setLoadingAi(false)
    }
  }

  const visibleStories = stories.filter((story) => activeFilter === 'Tudo' || story.meta.startsWith(activeFilter))

  return (
    <main>
      <nav className="nav shell" aria-label="Navegação principal">
        <a className="brand" href="#top" aria-label="Ateliê aberto, início">
          <span className="brand-mark">A</span>
          <span>Art&Design</span>
        </a>
        <div className="nav-links">
          <a href="#explorar">Explorar</a>
          <a href="#arquivo">Arquivo</a>
          <a href="#sobre">Sobre o projeto</a>
        </div>
        <a className="search-button" href="#arquivo" aria-label="Ir para o arquivo">
          Acervo <span aria-hidden="true">↓</span>
        </a>
      </nav>

      <header className="hero shell" id="top">
        <div className="hero-copy">
          <p className="eyebrow">Arte, moda e cultura visual</p>
          <h1>
            Ideias que vestem <em>o tempo.</em>
          </h1>
          <p className="hero-text">
            Um arquivo vivo para descobrir as conexões entre a criação artística, o corpo e a história que compartilhamos.
          </p>
          <a className="text-link" href="#explorar">
            Explorar o acervo <span>↓</span>
          </a>
        </div>
        <div className="hero-image-wrap">
          <img
            src="https://images.unsplash.com/photo-1566206091558-7f218b696731?auto=format&fit=crop&w=1200&q=85"
            alt="Detalhe de uma peça de roupa em uma composição editorial"
          />
          <span className="image-note">Imagem de referência · 01</span>
        </div>
      </header>

      <section className="intro-band" id="explorar">
        <div className="shell intro-grid">
          <p className="section-index">01 / Em destaque</p>
          <div>
            <h2>Um lugar para olhar devagar.</h2>
            <p className="section-lead">
              Pesquisas, obras e referências reunidas para conectar épocas, materiais e os gestos que transformam a cultura visual.
            </p>
          </div>
        </div>
      </section>

      <section className="shell stories" id="arquivo">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Seleção editorial</p>
            <h2>Do arquivo para a conversa</h2>
          </div>
          <div className="filters" aria-label="Filtrar conteúdo">
            {['Tudo', 'Arte', 'Moda'].map((filter) => (
              <button
                className={activeFilter === filter ? 'filter active' : 'filter'}
                key={filter}
                onClick={() => setActiveFilter(filter)}
                type="button"
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {loading && <p className="data-message">Carregando o acervo...</p>}
        {error && (
          <p className="data-message">
            {error} Execute a API com <code>uvicorn api:app --reload</code>.
          </p>
        )}

        {!loading && !error && (
          <div className="story-grid">
            {visibleStories.map((story, index) => (
              <article className={`story-card ${story.tone} ${index === 0 ? 'featured' : ''}`} key={story.title}>
                <div className="story-image">
                  <img
                    src={story.image}
                    alt=""
                    onError={(event) => {
                      event.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
                <div className="story-body">
                  <p className="card-category">{story.category}</p>
                  <h3>{story.title}</h3>
                  <p className="card-meta">{story.meta}</p>

                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '0.85rem', flexWrap: 'wrap' }}>
                    <a className="article-link" href={story.sourceUrl} target="_blank" rel="noreferrer">
                      Ler matéria <span aria-hidden="true">↗</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => handleTraceConnections(story)}
                      style={{
                        background: 'rgba(28, 25, 23, 0.08)',
                        border: '1px solid rgba(28, 25, 23, 0.22)',
                        borderRadius: '999px',
                        padding: '0.35rem 0.85rem',
                        fontSize: '0.8rem',
                        fontFamily: 'inherit',
                        cursor: 'pointer',
                        color: 'inherit',
                      }}
                    >
                      Traçar conexões IA ✦
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {selectedStory && (
        <div
          onClick={() => setSelectedStory(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.52)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            zIndex: 100,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#faf8f5',
              color: '#1c1917',
              maxWidth: '540px',
              width: '100%',
              borderRadius: '16px',
              padding: '1.75rem',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
              <div>
                <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.65 }}>
                  Fios da História · Conexões IA
                </p>
                <h3 style={{ marginTop: '0.3rem', fontSize: '1.2rem' }}>{selectedStory.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStory(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.1rem', cursor: 'pointer', color: 'inherit' }}
                aria-label="Fechar"
              >
                ✕
              </button>
            </div>

            <div style={{ marginTop: '1.25rem' }}>
              {loadingAi ? (
                <p style={{ fontStyle: 'italic', opacity: 0.75 }}>Analisando diálogos estéticos e históricos no acervo...</p>
              ) : (
                connectionResult && (
                  <>
                    <p style={{ lineHeight: 1.6, fontSize: '0.95rem' }}>{connectionResult.analysis}</p>
                    {connectionResult.related_titles?.length > 0 && (
                      <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(28, 25, 23, 0.12)' }}>
                        <p style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                          Obras e matérias conectadas neste acervo:
                        </p>
                        <ul style={{ paddingLeft: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.9rem' }}>
                          {connectionResult.related_titles.map((title) => (
                            <li key={title}>{title}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )
              )}
            </div>
          </div>
        </div>
      )}

      <section className="manifesto shell" id="sobre">
        <p className="section-index">02 / O projeto</p>
        <div>
          <p className="manifesto-quote">
            “A arte é o sussurro da alma em cores, formas e melodias que o tempo jamais apaga.”
          </p>
          <p className="manifesto-note">Este projeto busca integrar a história da moda com a arte e a cultura visual.</p>
        </div>
      </section>

      <footer className="footer shell">
        <span>Art&Design © 2026</span>
        <span>Art&Design</span>
        <a href="#top">Voltar ao topo ↑</a>
      </footer>
    </main>
  )
}

export default App