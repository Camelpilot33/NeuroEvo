/** Neural Network class*/
class NN {
    /**
     * @param {number} I number of input nodes
     * @param {number} O number of output nodes
     * @param {number} HL number of hidden layers
     * @param {number} n number of neurons per hidden layer
     */
    constructor (I, O, HL, n) {
        /** architecture for generating a new neural net @type {number[]}*/
        this.architecture = [I,O,HL,n]
        const rand = () => Math.random() - 0.5
        /**a "top down" view of the neural network  @type {number[]} */
        this.layers = [I].concat(new Array(HL).fill(n)).concat(O);
        /**the weights of the neural net @type {(number|string)[]} */
        this.weights = [new Array(n).fill(0).map(() => new Array(I + 1).fill(0).map(rand)),
        ...new Array(HL - 1).fill(0).map(() => new Array(n).fill(0).map(() => new Array(n + 1).fill(0).map(rand))),
        new Array(O).fill(0).map(() => new Array(n + 1).fill(0).map(rand))];
    }
    /**
     * Run the neural network on a set of data
     * @param {Array<number>} input array of input nodes
     * @returns {Array<number>} array of output nodes
     */
    run(input) {
        let curr;
        let output = input;
        for (let i = 1; i < this.layers.length; i++) {
            curr = output;
            let currWeights = this.weights[i - 1];
            output = [...new Array(this.layers[i]).fill(0).map((e, k) =>
                1 / (1 + Math.E ** (-curr.map((e, j) => e * currWeights[k][j]).reduce((a, b) => a + b, 0) - currWeights[k].at(-1)))
            )];
        }
        return output;
    }
    /**
     * static - mutate the neural network
     * @param {(number|string)[]} weights weights of the neural net
     * @param {number} chance chance of a mutation occuring
     * @param {number} change amount the net changes by at a mutation
     * @returns {(number|string)[]} new weights
     */
    static mutate(weights, chance, change) {
        return weights.map(e => typeof e == 'number' ? 
            (Math.random() < chance ? 
                change * (Math.random() * 2 - 1) : 
                e) : 
            NN.mutate(e,chance,change)
        );
    }
    /**
     * Create a new neural net based on weights
     * @param {number[]} architecture architecture of the neural net
     * @param {(number|string)[]} weights weights to generate
     * @returns {NN}
     */
    static fromWeights(architecture, weights) {
        let e=new NN(...architecture)
        e.weights = weights
        return e
    }
}
/** Generation manager class */
class Generation {
    /**
     * @param {number} size population size
     * @param {NN} basis basis network to get weights from
     * @param {number} sf selection factor - more => more selection
     */
    constructor (size, basis = new NN(2, 1, 2, 3),sf=2) {
        this.selectionFactor=sf
        this.architecture = basis.architecture
        this.pop = [];
        for (let i = 0; i < size; i++) {
            this.pop.push(basis);
        }
        this.gentop=[]
        this.fitness = new Array(size)
    }
    /**
     * Set the fitness of a member of a generation
     * @param {number} index 
     * @param {number} value fitness
     */
    setFitness(index, value) {
        this.fitness[index] = value;
    }
    /**
     * log of the fitness
     * @returns {number[]}
     */
    logFitness() {
        let sorted = this.pop.map((e, i) => this.fitness[i]).sort((a, b) => b - a);
        return [sorted[0],sorted.reduce((a,b)=>a+b,0)/sorted.length,sorted[sorted.length-1]]
    }
    /**
     * evolve to the next generation
     * @returns {Generation} next generation
     */
    evolve() {
        // [NN,fitness]
        let sorted = this.pop.map((e, i) => [e, this.fitness[i]]).sort((a, b) => b[1] - a[1]);
        this.gentop.push(sorted[0])
        //top 10% + random mut
        let nextgen = sorted.slice(0, this.pop.length * 0.1).map(e => e[0]);
        while (nextgen.length < this.pop.length) {
            let chosen = sorted[Math.floor(Math.random() ** this.selectionFactor * this.pop.length)][0];
            const b = NN.mutate(chosen.weights, 0.1, 1);
            const a = NN.fromWeights(this.architecture, b);
            nextgen.push(a);
        }
        /* TODO
         * ADD crossover
         */
        this.pop=nextgen;
        this.fitness = new Array(this.pop.length)
        return this
    }
}

let log = []
let genetics = new Generation(20,new NN(2,1,3,3));
for (let i=0;i<1000;i++) {
    genetics.evolve()
    for (let i = 0; i < 20; i++) {
        genetics.setFitness(i, 1-Math.abs(0.5-genetics.pop[i].run([-1,1])[0]));
    }
    b = {}
    genetics.logFitness().map(e => e.toFixed(4)).forEach((e, i) => b[["Max", "Avg", "Min"][i]] = e);
    log.push(b)
}
let best = genetics.gentop[genetics.gentop.length - 1];
console.log(best)
console.log(best[0].run([10, 13])[0])
// console.table(log)
