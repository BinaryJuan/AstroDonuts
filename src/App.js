import Game from './Game'

const App = () => {
  setInterval(() => {
    document.title = "🚀 Astro Donuts 🚀"
    setTimeout(() => {
      document.title = "🍩 Astro Donuts 🍩"
    }, 500)
  }, 1000)

  return (
    <div className='gameContainer'>
      <Game />
    </div>
  )
}

export default App