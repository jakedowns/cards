- update server to write game state to disk
    - update server to check for disk-level game state on boot

- add a new solitaire mode
    - "new game" screen where you can choose from "memory" or "solitaire"
        - TODO: auto-suggest previously selected WORLD/ROOM/GAME
        - TODO: when you select a world, populate the rooms list
                - when you select a room, populate the games list
    - import deck of cards mesh+texture

- add world-level
    - add room-level per world

    - add "world selection screen / world-to-world transitions"
    - add "room selection screen / room-to-room transitions"
    - add "game selection screen / game-to-game transitions"

- persistent client ids

- multi-peer chat working

- memory game
    - fix table -> player hand zone transition animation
    - add nice sound on a match
    - add bonk sound on no match
    - add option to disable sounds
    - add slider to control sound volume (independent of voice chat volume)
    - prevent players from blocking cards with their head
    - import alien
    - project face onto alien's face

- debug mode
    change cursor color
    add border to screen
    skip name="pointer" during debug intersect

- api
    - flat file(s)? mysql? firebase? laravel livewire?