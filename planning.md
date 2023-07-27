# Bat Muster - Project 1 Planning
Louis Pino

## Game Choice - Bat Buster


## Screenshots for Wireframes
![Screenshot 2023-07-21 at 2 58 11 PM](https://github.com/LouisPino/bat-hunter-demo/assets/130365689/c505b79b-1952-4742-8276-9dd3d50aba5f)


## Pseudocode

1- Define required constants
 - Board Size / Borders
 - Guy object
 - Bat class
 - Weapon class and dictionary

1.1 Event Listeners
 - Space bar
 - Click
 - Mouse moving
 - Keypress

2- cache interactive elements
 - weapon graphics
 - guy
 - bats
 - main arena
 - modal buttons
 - score display
 - life display

3- Define state variables
 - lives
 - score
 - Attack or defense mode
 - mouse position

4- Define required functions
 - move the guy
 - move the bats
    - reverse the bats when hitting a wall
    - kill the bats when health at 0
 - lose a life when touching a bat
 - Decrease bat health when shot
 - Check for collisions
 - Initiate attack
 - Initiate defense
 - Switch weapons
 - generate new bat
 - Renders
 - Game Over

5- On load:
- Display opening Modal prompting user to select game mode
-Run startGame or startGameDefense
      -StartGame calls init and initAttack
      -startgameDefense calls init and initDefense

5.1- On Game Over:
 - Display the same modal with different text
 - Clear the board / disable event listeners