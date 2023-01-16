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
        document.querySelector('.gameContainer').style.height = '100vh'
        document.querySelector('.gameContainer').style.padding = '0'
        document.querySelector('.game canvas').style.display = 'block'
        document.querySelector('.game').style.padding = '10px 10px'
        phaserGameRef.current.scene.scenes[0].scene.resume()
        document.getElementById('play-button').style.display = 'none'
        document.querySelector('.descriptionContainer').style.display = 'none'
        document.querySelector('.game canvas').style.paddingBottom = '60px'
        // ACA VA EL SOUNDTRACK
    }

    return (
        <div className='game'>
            <img src='title.png' alt='Astro Donuts' />
            <div id="game"></div>
            <div className='descriptionContainer'>
                <p className='description intro'>
                    Astro Donuts
                    is a game about an astronaut that has to collect all the
                    donuts in the galaxy. But be careful, there are many
                    aliens who want to kill you. Use your habilities to pilot the spaceship
                    and collect all the donuts you can.
                </p>
                <p className='description controls'>
                    Here is a manual on how the spaceship works:
                </p>
                <div className='arrows'>
                    <div className='arrow'>
                        <img src='arrow-up.png' alt='arrow up' />
                        <p>Go up</p>
                    </div>
                    <div className='arrow'>
                        <img src='arrow-right.png' alt='arrow right' />
                        <p>Go right</p>
                    </div>
                    <div className='arrow'>
                        <img src='arrow-down.png' alt='arrow down' />
                        <p>Go down</p>
                    </div>
                    <div className='arrow'>
                        <img src='arrow-left.png' alt='arrow left' />
                        <p>Go left</p>
                    </div>
                </div>
                <p className='plus'>+</p>
                <div className='space'>
                    <img src='space.png' alt='space' />
                    <p>Shoot in the direction you are aiming</p>
                </div>
                <div className='rules'>
                    <h3>Rules</h3>
                    <ul>
                        <li>Collect all the donuts you can</li>
                        <li>Donuts give a score of +10</li>
                        <li>Aliens give a score of +20</li>
                        <li>Asteroids can be used as cover</li>
                        <li>Making diagonal movements will help avoid the aliens</li>
                    </ul>
                </div>
            </div>
            <button id='play-button'>PLAY</button>
        </div>
    )
}

export default Game