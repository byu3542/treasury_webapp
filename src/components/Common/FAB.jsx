import './FAB.css'

export default function FAB({ onClick }) {
  return (
    <button className="fab" onClick={onClick} title="New Transaction">
      <span className="fab-icon">+</span>
    </button>
  )
}
