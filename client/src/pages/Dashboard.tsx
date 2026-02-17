import { Link } from 'react-router-dom'
import { tools } from '../registry/tools'
import { ToolIcon } from '../ui/icons'

function Dashboard() {
  return (
    <section className="dashboard">
      <div className="dashboard-head">
        <div>
          <p className="dashboard-eyebrow">WebTools Platform</p>
          <h2>Herramientas web en un solo lugar</h2>
          <p>
            Elige una herramienta, pega tu contenido y obtén resultados en
            segundos. Interfaz simple, clara y pensada para uso diario.
          </p>
        </div>
        <span className="dashboard-badge">{tools.length} herramienta(s)</span>
      </div>

      <div className="cards-grid">
        {tools.map((tool) => (
          <Link key={tool.id} to={tool.path} className="tool-card">
            <div className="tool-card-head">
              <div className="tool-card-title">
                <span className="tool-card-icon" aria-hidden="true">
                  <ToolIcon toolIcon={tool.icon} />
                </span>
                <h3>{tool.name}</h3>
              </div>
              <span>Disponible</span>
            </div>
            <p>{tool.description}</p>
            <div className="tool-card-foot">
              <span>Abrir herramienta</span>
              <span className="arrow">{'->'}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default Dashboard
