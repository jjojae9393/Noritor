interface Game {
  id: string
  name: string
  icon: string
  desc: string
  players: string
  ready: boolean
}

const GAMES: Game[] = [
  { id: 'baseball', name: '숫자야구', icon: '⚾', desc: '숨긴 숫자를 맞혀라', players: '2인', ready: true },
  { id: 'omok', name: '오목', icon: '⚫', desc: '먼저 다섯 목을 완성', players: '2인', ready: false },
]

interface HubScreenProps {
  onSelectGame: (gameId: string) => void
}

export default function HubScreen({ onSelectGame }: HubScreenProps) {
  return (
    <div className="screen">
      <div className="game-grid">
        {GAMES.map((game) => (
          <button
            key={game.id}
            className={`game-card${game.ready ? '' : ' soon'}`}
            onClick={() => game.ready && onSelectGame(game.id)}
            disabled={!game.ready}
          >
            <div className="game-icon">{game.icon}</div>
            <div className="game-name">{game.name}</div>
            <div className="game-desc">{game.desc}</div>
            <div className="game-foot">
              <span className="game-players">{game.players}</span>
              {game.ready ? (
                <span className="game-badge ready">플레이</span>
              ) : (
                <span className="game-badge soon">준비중</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
