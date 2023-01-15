import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import { preload, create, update } from './gameFunctions'

const Game = () => {
    const phaserGameRef = useRef(null)
    useEffect(() => {
        if (phaserGameRef.current) {
            return
        }
        phaserGameRef.current = new Phaser.Game({
            type: Phaser.AUTO,
            width: 1000,
            height: 600,
            parent: 'game',
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 0 },
                    debug: false
                }
            },
            scene: {
                preload,
                create,
                update
            }
        })
        const playButton = document.getElementById('play-button')
        playButton.addEventListener('click', startGame)
    }, [])

    const startGame = () => {
        new AudioContext()
        new Audio('play.mp3').play()
        document.querySelector('.game canvas').style.display = 'block'
        phaserGameRef.current.scene.scenes[0].scene.resume()
        document.getElementById('play-button').style.display = 'none'
        document.querySelector('.game canvas').style.paddingBottom = '60px'
        // ACA VA EL SOUNDTRACK
    }

    return (
        <div className='game'>
            <img src='title.png' alt='Astro Donuts' />
            <div id="game"></div>
            <button id='play-button'>PLAY</button>
        </div>
    )
}

export default Game