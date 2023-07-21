# Bat Hunter - Project 1 Planning
Louis Pino

## Game Choice - Bat Hunter


## Screenshots for Wireframes
![Screenshot 2023-07-21 at 2 58 11 PM](https://github.com/LouisPino/bat-hunter-demo/assets/130365689/c505b79b-1952-4742-8276-9dd3d50aba5f)


## Pseudocode

MVP:
Guy moves within borders√
Enemies spawn every 2 seconds
Click to decrement enemy health by 1
One life, you touch you die
Restart modal

Stretch:
Change weapons with number buttons
Enemys spawn faster over time
Enemy health grows over time
3 lives


Extra Stretch: 
Level system



Variables---
totalLives = 3
guySpeed = 200ms
batSpeed = 200ms
kills = 0
batCount = 0


enemy class - 
health: 10
location: chooseLocation()
direction: [Random(1-5)], [Random(1-5)] - represents x and y movement speed in pixels per cycle
reverse direction()
touchGuy()
movebat()
die()



functions---
init(){
    lives = totalLives



}


guyMoves-
setInterval(move, speed) 

decrementHealth() - 


reverse direction() - If touching top or bottom, ydirection *= -1, if touching left or right wall, x direction *= -1.

move() -
if W held down && ypos<maxHeight, y+=1px
if S held down && ypos>minHeight, y-=1px
if A held down && xpos>minWidth, x+=1px
if D held down && xpos<maxWidth, x-=1px
renderGuy()


loseLife()-
lives -= 1
postLifeLost()
eraseBats()







render(){
    renderGuy()
    renderLives()


}

renderLives(){
    in div spaced on right of flex box header-
    for(i=0; i<totalLives%lives; i++){
        append empty hearts
    }
    for (for(i=0; i<lives; i++){
        append hearts
    }
}



 touchGuy(){
    if (batXRange crosses guy Xrange && bat yrange crosses guy yrange){
        loseLife
    }

 }

 postLifeLost(){
    Basically init but without resetting some variables (kill count stays, don't reinitialize lives to 0, etc.)

 }

 eraseBats(){
    remove all bats
 }

 generateBat(){
    batCount++
    bat[i]= new Enemy()
 }

 moveBat(){
    setInterval(function(){
    yPos += direction[1]
    xPos += direction[0]}, 200)
 }
 
 die(){
    if (this.health <=0){this.remove??}
    bat[this] = null
 }