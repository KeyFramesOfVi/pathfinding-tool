## Dynamic Pathfinding Tool

A tool to hopefully alleviate the task of creating a world for robotic agents when trying to test their ability to navigate a dynamically changing world, with little to no information about that world.

This is currently a WiP application that I have some hard coded inputs for (Such as the walls). I can generate my own walls manually but I have it set up like this so that I can test easier.

If you want to see it work for Multipath Generated Adaptive A* (MPGAA*), the algorithm that I am currently testing it on, feel free to download and try this out. npm should be the only requirement for this application as of right now.

  

## To-do List
* Erase "Observed" Node List whenever a user does a new search, since it currently keeps old information.
* Add a "History" object that saves every state the agent makes from the beginning of the application until it reaches (or fails to reach) the goal.
* Add a "animate" button that plays the history and renders all state from start to finish under a set interval, in order to show how the algorithm plans during every step.
* Add the ability to draw walls and obstructions during this animate phase, so that the robot can discard all of it's planning up to that point and replan around the changing world. This will really display the strengths of dynamic algorithms, which I feel are never really shown in full light.
* Refactor the code so that React fetches information from a back-end. Working in JavaScript is great for simplicity, but definitely has an issue regarding speed due to these algorithms being too difficult (at least for me) to make "Pure Functions". This is a long-term change that will not happen immediately, but is something to consider. It would also make it easier for researchers to add to the framework with more popular languages for algorithms like these, such as A* and Python.

