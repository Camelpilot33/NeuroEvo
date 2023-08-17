# NeuroEvo
a simple Javascript evolutionary algorithm for training neural networks

## Neural net usage
Create a neural net:
```js
// A network with 2 inputs, 1 output, 3 hidden layers, and 5 neurons per hidden layer
let network = new NN(2,1,3,5)
```
From weights array:
```js
let network = NN.fromWeights(nnArchitecture, inputWeights)
```
run the net on data:
```js
network.run([10,20,30])
```
## Evolution Usage
Create a new generation:
```js
let generation = new Generation(20, new NN(2,1,3,5))
```
Repeatedly assign fitness and evolve the generation:
```js
for (let i = 0; i < 1000; i++) { //1000 generations
    for (let i = 0; i < 20; i++) { //assign fitness values to each of the generations
        generation.setFitness(i, - Math.abs(0 - generation.pop[i].run([-1, 1])[0])); //set fitness to negative distance from 0
    }
    generation.evolve();
}
//log the best network's answer
console.log(generation.gentop[generation.gentop.length - 1][0].run([-1,1])[0])
//possible output: 0.002746631311830884
```
