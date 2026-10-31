import { useEffect, useState } from 'react'
import './App.css'

type Story = { category: string; title: string; meta: string; image: string; sourceUrl: string; tone: string }

function App() {
  const [stories, setStories] = useState<Story[]>([])
  const [activeFilter, setActiveFilter] = useState('Tudo')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('http://localhost:8000/api/items')
      .then((response) => {
        if (!response.ok) throw new Error('A API ainda não está disponível.')
        return response.json()
      })
      .then((items: Array<{ title: string; category: string; description: string; image_url: string; source_url: string }>) => {
        setStories(items.map((item, index) => ({
          category: 'Arquivo editorial',
          title: item.title,
          meta: item.category,
          image: item.image_url,
          sourceUrl: item.source_url,
          tone: ['ochre', 'ink', 'rose'][index % 3],
        })))
      })
      .catch((requestError: Error) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [])

  const visibleStories = stories.filter((story) => activeFilter === 'Tudo' || story.meta.startsWith(activeFilter))

  return (
    <main>
      <nav className="nav shell" aria-label="Navegação principal">
        <a className="brand" href="#top" aria-label="Ateliê aberto, início"><span className="brand-mark">A</span><span>Art&Design</span></a>
        <div className="nav-links"><a href="#explorar">Explorar</a><a href="#arquivo">Arquivo</a><a href="#sobre">Sobre o projeto</a></div>
        <button className="search-button" type="button" aria-label="Buscar no arquivo">Buscar <span aria-hidden="true">↗</span></button>
      </nav>

      <header className="hero shell" id="top">
        <div className="hero-copy"><p className="eyebrow">Arte, moda e cultura visual</p><h1>Ideias que vestem <em>o tempo.</em></h1><p className="hero-text">Um arquivo vivo para descobrir as conexões entre a criação artística, o corpo e a história que compartilhamos.</p><a className="text-link" href="#explorar">Explorar o acervo <span>↓</span></a></div>
        <div className="hero-image-wrap"><img src="https://images.unsplash.com/photo-1566206091558-7f218b696731?auto=format&fit=crop&w=1200&q=85" alt="Detalhe de uma peça de roupa em uma composição editorial" /><span className="image-note">Imagem de referência · 01</span></div>
      </header>

      <section className="intro-band" id="explorar"><div className="shell intro-grid"><p className="section-index">01 / Em destaque</p><div><h2>Um lugar para olhar devagar.</h2><p className="section-lead">Pesquisas, obras e referências reunidas para conectar épocas, materiais e os gestos que transformam a cultura visual.</p></div></div></section>

      <section className="shell stories" id="arquivo">
        <div className="section-heading"><div><p className="eyebrow">Seleção editorial</p><h2>Do arquivo para a conversa</h2></div><div className="filters" aria-label="Filtrar conteúdo">{['Tudo', 'Arte', 'Moda'].map((filter) => <button className={activeFilter === filter ? 'filter active' : 'filter'} key={filter} onClick={() => setActiveFilter(filter)} type="button">{filter}</button>)}</div></div>
        {loading && <p className="data-message">Carregando o acervo...</p>}
        {error && <p className="data-message">{error} Execute a API com <code>uvicorn api:app --reload</code>.</p>}
        {!loading && !error && <div className="story-grid">{visibleStories.map((story, index) => <article className={`story-card ${story.tone} ${index === 0 ? 'featured' : ''}`} key={story.title}><div className="story-image"><img src={story.image} alt="" onError={(event) => { event.currentTarget.style.display = 'none' }} /></div><div className="story-body"><p className="card-category">{story.category}</p><h3>{story.title}</h3><p className="card-meta">{story.meta}</p><a className="article-link" href={story.sourceUrl} target="_blank" rel="noreferrer">Ler matéria <span aria-hidden="true">↗</span></a></div></article>)}</div>}
      </section>

      <section className="manifesto shell" id="sobre"><p className="section-index">02 / O projeto</p><div><p className="manifesto-quote">“A arte é o sussurro da alma em cores, formas e melodias que o tempo jamais apaga.”</p><p className="manifesto-note">Este projeto busca integrar a história da moda com a arte e a cultura visual.</p></div></section>
      <footer className="footer shell"><span>Art&Design © 2026</span><span>Art&Design</span><a href="#top">Voltar ao topo ↑</a></footer>
    </main>
  )
}

export default App