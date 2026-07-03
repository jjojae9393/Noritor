import { useState, useRef, useCallback } from 'react'
import { db } from './firebase'
import { ref, update, remove, get } from 'firebase/database'
import HubScreen from './screens/HubScreen'
import LobbyScreen from './screens/LobbyScreen'
import RoomScreen from './screens/RoomScreen'
import PlayingScreen from './screens/PlayingScreen'
import EndedScreen from './screens/EndedScreen'

type Screen = 'hub' | 'lobby' | 'room' | 'playing' | 'ended'

export default function App() {
  const [screen, setScreen] = useState<Screen>('hub')
  const [roomId, setRoomId] = useState<string | null>(null)
  const [myRole, setMyRole] = useState<string | null>(null)
  const [myNumber, setMyNumber] = useState('')
  const [roomName, setRoomName] = useState('')
  const [winner, setWinner] = useState<string | null>(null)
  const [myGuessCount, setMyGuessCount] = useState(0)

  const listenersRef = useRef<(() => void)[]>([])

  const selectGame = useCallback((gameId: string) => {
    if (gameId === 'baseball') setScreen('lobby')
  }, [])

  const goToHub = useCallback(() => {
    setScreen('hub')
  }, [])

  const goToRoom = useCallback((id: string, role: string, name: string) => {
    setRoomId(id)
    setMyRole(role)
    setRoomName(name)
    setScreen('room')
  }, [])

  const startGame = useCallback((number: string) => {
    setMyNumber(number)
    setScreen('playing')
  }, [])

  const endGame = useCallback((winnerRole: string, guessCount: number) => {
    setWinner(winnerRole)
    setMyGuessCount(guessCount)
    setScreen('ended')
  }, [])

  const backToLobby = useCallback(async () => {
    // Clean up Firebase room data before leaving
    if (roomId && myRole) {
      await remove(ref(db, `rooms/${roomId}/${myRole}`))
      const oppRole = myRole === 'p1' ? 'p2' : 'p1'
      const oppSnap = await get(ref(db, `rooms/${roomId}/${oppRole}`))
      if (!oppSnap.exists()) {
        await remove(ref(db, `rooms/${roomId}`))
      } else {
        await update(ref(db, `rooms/${roomId}`), { status: 'waiting' })
      }
    }

    setRoomId(null)
    setMyRole(null)
    setMyNumber('')
    setRoomName('')
    setWinner(null)
    setMyGuessCount(0)
    setScreen('lobby')
  }, [roomId, myRole])

  const backToRoom = useCallback(async () => {
    if (!roomId || !myRole) return

    // Check if room still exists
    const roomSnap = await get(ref(db, `rooms/${roomId}`))
    if (!roomSnap.exists()) {
      backToLobby()
      return
    }

    // Reset game state in Firebase, keep players and chat
    await update(ref(db, `rooms/${roomId}`), {
      status: 'waiting',
      turn: 'p1',
      winner: null,
    })
    // Only reset ready for players that still exist
    const room = roomSnap.val()
    if (room.p1) await update(ref(db, `rooms/${roomId}/p1`), { ready: false })
    if (room.p2) await update(ref(db, `rooms/${roomId}/p2`), { ready: false })
    await remove(ref(db, `rooms/${roomId}/guesses`))

    setMyNumber('')
    setWinner(null)
    setMyGuessCount(0)
    setScreen('room')
  }, [roomId, myRole, backToLobby])

  return (
    <>
      <div className="header">
        {screen === 'hub' ? (
          <>
            <h1>노리터🎡</h1>
            <p>게임을 선택하세요</p>
          </>
        ) : (
          <>
            <h1>숫자야구⚾</h1>
            {screen === 'lobby' && <p>방을 만들거나 참가하세요</p>}
          </>
        )}
      </div>

      {screen === 'hub' && (
        <HubScreen onSelectGame={selectGame} />
      )}

      {screen === 'lobby' && (
        <LobbyScreen onJoinRoom={goToRoom} onBackToHub={goToHub} />
      )}

      {screen === 'room' && roomId && myRole && (
        <RoomScreen
          roomId={roomId}
          myRole={myRole}
          roomName={roomName}
          onGameStart={startGame}
          onLeave={backToLobby}
        />
      )}

      {screen === 'playing' && roomId && myRole && (
        <PlayingScreen
          roomId={roomId}
          myRole={myRole}
          myNumber={myNumber}
          onGameEnd={endGame}
        />
      )}

      {screen === 'ended' && roomId && winner && myRole && (
        <EndedScreen
          roomId={roomId}
          winner={winner}
          myRole={myRole}
          myNumber={myNumber}
          myGuessCount={myGuessCount}
          onBackToRoom={backToRoom}
          onLeave={backToLobby}
        />
      )}
    </>
  )
}
