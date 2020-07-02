/*
 * Our application servers receive approximately 20 000
 * http requests  per second. Response timeout is 19000ms.
 * Implement a statistics collector that calculates the
 * median and average request response times for a 7 day
 * dataset.
 *
 * Assigment:
 * 1. Implement StatsCollector
 * 2. Write tests (below StatsCollector)
 */

// JSFiddle Code : https://jsfiddle.net/rachhek/xsL3gv2n/

"use strict";

// Since, the estimated dataset of 7 days with 20000 http request per second (7 * 24 * 60 * 60 * 20000)
// This is obviously very huge. So, normal

//HeapBase class which will be used to inherit MinHeap and MaxHeap Classes
class HeapBase {
  constructor() {
    this.heapArr = [];
  }

  //get the indexes
  getLeftChildIdx(parentIdx) {
    let leftChildIdx = parentIdx * 2 + 1;
    return leftChildIdx;
  }

  getRightChildIdx(parentIdx) {
    let rightChildIdx = parentIdx * 2 + 2;
    return rightChildIdx;
  }

  getParentIdx(childIdx) {
    let parentIdx = Math.floor((childIdx - 1) / 2);
    return parentIdx;
  }

  //check if the childs exists
  doesLeftChildExist(parentIdx) {
    let leftChildIdx = this.getLeftChildIdx(parentIdx);
    return this.heapArr[leftChildIdx] != undefined;
  }

  doesRightChildExist(parentIdx) {
    let rightChildIdx = this.getRightChildIdx(parentIdx);
    return this.heapArr[rightChildIdx] != undefined;
  }

  doesParentExist(childIdx) {
    let parentIdx = this.getParentIdx(childIdx);
    return parentIdx >= 0;
  }

  // Get the child items
  getLeftChild(parentIdx) {
    let leftChildIdx = this.getLeftChildIdx(parentIdx);
    return this.heapArr[leftChildIdx];
  }

  getRightChild(parentIdx) {
    let rightChildIdx = this.getRightChildIdx(parentIdx);
    return this.heapArr[rightChildIdx];
  }

  getParent(childIdx) {
    let parentIdx = this.getParentIdx(childIdx);
    return this.heapArr[parentIdx];
  }

  swapItems(idx1, idx2) {
    let temp = this.heapArr[idx1];
    this.heapArr[idx1] = this.heapArr[idx2];
    this.heapArr[idx2] = temp;
  }

  getRoot() {
    return this.heapArr[0];
  }
}

//MinHeap class inherited from HeapBase. Stores the minimum item in the top.
class MinHeap extends HeapBase {
  constructor() {
    super();
  }

  addToHeap(item) {
    this.heapArr.push(item);
    this.moveItemUpTheHeap();
    return this.heapArr;
  }

  //removes the root node of the Heap and restructures it.
  extractRoot() {
    let root = this.heapArr[0];
    let endItem = this.heapArr[this.heapArr.length - 1];
    this.heapArr[0] = endItem;
    this.heapArr.pop();
    this.moveItemDownTheHeap();
    return root;
  }

  //moves the last item upwards towards the heap until its appropriate position is found
  moveItemUpTheHeap() {
    let itemIdx = this.heapArr.length - 1;

    //Keep moving the item up the heap array until it finds its position
    while (this.doesParentExist(itemIdx)) {
      let parent = this.getParent(itemIdx),
        item = this.heapArr[itemIdx];

      //exit condition for while loop
      if (parent < item) break;

      let parentIdx = this.getParentIdx(itemIdx);
      this.swapItems(itemIdx, parentIdx);

      //set the next index to be the parent index. Continues the loop
      itemIdx = parentIdx;
    }
    return this.heapArr;
  }

  //moves the item in the root node to its appropriate position in the heap
  moveItemDownTheHeap() {
    let itemIdx = 0;

    //continue the loop until the left child exist.
    while (this.doesLeftChildExist(itemIdx)) {
      let smallerChildIdx = this.getLeftChildIdx(itemIdx);

      if (
        this.doesRightChildExist(itemIdx) &&
        this.getRightChild(itemIdx) < this.getLeftChild(itemIdx)
      ) {
        smallerChildIdx = this.getRightChildIdx(itemIdx);
      }

      //condition to break the loop. if the item is smaller than its children
      if (this.heapArr[itemIdx] < this.heapArr[smallerChildIdx]) break;

      //swap items with the smaller child
      this.swapItems(itemIdx, smallerChildIdx);
      itemIdx = smallerChildIdx;
    }
  }
}

class MaxHeap extends HeapBase {
  constructor() {
    super();
  }
  addToHeap(item) {
    this.heapArr.push(item);
    this.moveItemUpTheHeap();
    return this.heapArr;
  }

  extractRoot() {
    let root = this.heapArr[0];
    let endItem = this.heapArr[this.heapArr.length - 1];
    this.heapArr[0] = endItem;
    this.heapArr.pop();
    this.moveItemDownTheHeap();
    return root;
  }

  moveItemUpTheHeap() {
    let itemIdx = this.heapArr.length - 1;
    //Keep moving the item up the heap array until it finds its position
    while (this.doesParentExist(itemIdx)) {
      let parent = this.getParent(itemIdx),
        item = this.heapArr[itemIdx];
      //exit condition for while loop.
      if (parent > item) break;
      let parentIdx = this.getParentIdx(itemIdx);
      this.swapItems(itemIdx, parentIdx);
      itemIdx = parentIdx;
    }
    return this.heapArr;
  }

  moveItemDownTheHeap() {
    let itemIdx = 0;

    //keep looping until the left child exist.
    while (this.doesLeftChildExist(itemIdx)) {
      let biggerChildIdx = this.getLeftChildIdx(itemIdx);
      if (
        this.doesRightChildExist(itemIdx) &&
        this.getRightChild(itemIdx) > this.getLeftChild(itemIdx)
      ) {
        biggerChildIdx = this.getRightChildIdx(itemIdx);
      }

      //break condition for the loop.
      if (this.heapArr[itemIdx] > this.heapArr[biggerChildIdx]) break;

      //swap item with the bigger child. case of Max heap
      this.swapItems(itemIdx, biggerChildIdx);
      itemIdx = biggerChildIdx;
    }
  }
}

// State collector
class StatsCollector {
  constructor(/*void*/) {
    this.responseArr = [];
    this.lowerHalf = new MaxHeap();
    this.upperHalf = new MinHeap();
  }

  pushValue(responseTimeMs /*number*/) /*void*/ {
    this.responseArr.push(responseTimeMs);

    //decide which heap to add the incoming item
    //add to the lower half if its a. empty or b. current item is smaller than root of lower half
    if (
      this.lowerHalf.heapArr.length == 0 ||
      responseTimeMs < this.lowerHalf.getRoot()
    ) {
      let res = this.lowerHalf.addToHeap(responseTimeMs);
    } else {
      let res = this.upperHalf.addToHeap(responseTimeMs);
    }

    //continue balancing the heap to ensure two heaps have equal sizes
    this.balanceTwoHeaps();
  }

  getMedian() /*number*/ {
    //Logic : if both halves are equal, take the average of the root nodes from both the halves
    //      : if the halves are not equal, take the root node of the bigger half among the two.

    // if both halves are equal return the average of the root node
    if (this.lowerHalf.heapArr.length == this.upperHalf.heapArr.length) {
      let median = parseFloat(
        (this.lowerHalf.getRoot() + this.upperHalf.getRoot()) / 2
      );
      return median;
    } else {
      //if halves are not equal, return the root node of the bigger half
      let biggerHeap =
        this.lowerHalf.heapArr.length > this.upperHalf.heapArr.length
          ? this.lowerHalf
          : this.upperHalf;
      return biggerHeap.getRoot();
    }
  }

  balanceTwoHeaps() {
    //No need for balancing the heap if a. their lengths are equal b. or if difference is only 1
    let areLengthEqual =
      this.lowerHalf.heapArr.length == this.upperHalf.heapArr.length;
    let lengthDifference = Math.abs(
      this.lowerHalf.heapArr.length - this.upperHalf.heapArr.length
    );
    if (areLengthEqual || lengthDifference == 1) return;
    let smallerHeap =
      this.lowerHalf.heapArr.length < this.upperHalf.heapArr.length
        ? this.lowerHalf
        : this.upperHalf;
    let biggerHeap =
      this.lowerHalf.heapArr.length > this.upperHalf.heapArr.length
        ? this.lowerHalf
        : this.upperHalf;
    let nodeToShift = biggerHeap.extractRoot();
    smallerHeap.addToHeap(nodeToShift);
    biggerHeap.moveItemUpTheHeap();
  }

  getAverage() /*number*/ {
    let total = 0;
    this.responseArr.forEach(function (item) {
      total += item;
    });
    return parseFloat(total / this.responseArr.length);
  }
}

// Configure Mocha, telling both it and chai to use BDD-style tests.
mocha.setup("bdd");
chai.should();

describe("HeapBaseChecker", function () {
  let dataset = [1, 2, 3, 4, 5, 6];
  let heapBase = new HeapBase();
  heapBase.heapArr = dataset;
  it("it should calculate if left child exist, function doesLeftChildExist(parentIdx) ", function () {
    let test1 = heapBase.doesLeftChildExist(5) == false;
    let test2 = heapBase.doesLeftChildExist(1) == true;
    true.should.equal(test1 && test2);
  });
  it("it should calculate if right child exist, function doesrightChildExist(parentIdx) ", function () {
    let test1 = heapBase.doesRightChildExist(5) == false;
    let test2 = heapBase.doesRightChildExist(1) == true;
    true.should.equal(test1 && test2);
    //true.should.equal(sta==1)
  });
  it("it should calculate if parent exist, function doesParentExist(parentIdx) ", function () {
    let test1 = heapBase.doesParentExist(0) == false;
    let test2 = heapBase.doesParentExist(1) == true;
    let test3 = heapBase.doesParentExist(5) == true;
    true.should.equal(test1 && test2 && test3);
  });
  it("it should get index of left child function getLeftChildIdx(parentIdx) ", function () {
    let test1 = heapBase.getLeftChildIdx(0) == 1;
    let test2 = heapBase.getLeftChildIdx(1) == 3;
    let test3 = heapBase.getLeftChildIdx(2) == 5;
    true.should.equal(test1 && test2 && test3);
  });
  it("it should get index of right child function getRightChildIdx(parentIdx) ", function () {
    let test1 = heapBase.getRightChildIdx(0) == 2;
    let test2 = heapBase.getRightChildIdx(1) == 4;
    let test3 = heapBase.getRightChildIdx(2) == 6;
    true.should.equal(test1 && test2 && test3);
  });
  it("it should get index of parent function getParentIdx(childIdx) ", function () {
    let test1 = heapBase.getParentIdx(1) == 0;
    let test2 = heapBase.getParentIdx(2) == 0;
    let test3 = heapBase.getParentIdx(3) == 1;
    true.should.equal(test1 && test2 && test3);
  });
  it("it should get left child function getLeftChild(parentIdx) ", function () {
    let test1 = heapBase.getLeftChild(0) == 2;
    let test2 = heapBase.getLeftChild(1) == 4;
    let test3 = heapBase.getLeftChild(5) == undefined;
    true.should.equal(test1 && test2 && test3);
  });
  it("it should get right child. function getLeftChild(parentIdx) ", function () {
    let test1 = heapBase.getRightChild(0) == 3;
    let test2 = heapBase.getRightChild(1) == 5;
    let test3 = heapBase.getRightChild(2) == undefined;
    true.should.equal(test1 && test2 && test3);
  });
  it("it should get parent. function getParent(childIdx) ", function () {
    let test1 = heapBase.getParent(0) == undefined;
    let test2 = heapBase.getParent(1) == 1;
    let test3 = heapBase.getParent(3) == 2;
    true.should.equal(test1 && test2 && test3);
  });
});

describe("MinHeapChecker", function () {
  it("it should check if item get moved up the min heap", function () {
    let minHeap = new MinHeap();
    minHeap.heapArr = [2, 3, 4, 5, 6, 7, 1];
    let result1 = [1, 3, 2, 5, 6, 7, 4];
    minHeap.moveItemUpTheHeap();
    minHeap.heapArr.should.to.eql(result1);
  });
  it("it should check if item moved down the min heap", function () {
    let minHeap = new MinHeap();
    minHeap.heapArr = [7, 6, 5, 4, 3, 2];
    let result1 = [5, 6, 2, 4, 3, 7];
    minHeap.moveItemDownTheHeap();
    minHeap.heapArr.should.to.eql(result1);
  });
  it("it should check if item got added to the heap", function () {
    let minHeap = new MinHeap();
    minHeap.heapArr = [2, 3, 4, 5, 6, 7];
    minHeap.addToHeap(1);
    let result1 = [1, 3, 2, 5, 6, 7, 4];
    minHeap.heapArr.should.to.eql(result1);
  });
  it("it should check if item got extracted from the heap", function () {
    let minHeap = new MinHeap();
    minHeap.heapArr = [8, 6, 5, 4, 3, 2, 7];
    let root = minHeap.extractRoot();
    let result1 = [5, 6, 2, 4, 3, 7];
    minHeap.heapArr.should.to.eql(result1);
    root.should.equal(8);
  });
});

describe("MaxHeapChecker", function () {
  it("it should check if last item got moved up the max heap", function () {
    let maxHeap = new MaxHeap();
    maxHeap.heapArr = [2, 3, 4, 5, 6, 7];
    let result1 = [7, 3, 2, 5, 6, 4];
    maxHeap.moveItemUpTheHeap();
    maxHeap.heapArr.should.to.eql(result1);
  });
  it("it should check if root item moved down the max heap", function () {
    let maxHeap = new MaxHeap();
    maxHeap.heapArr = [1, 6, 5, 4, 3, 2];
    let result1 = [6, 4, 5, 1, 3, 2];
    maxHeap.moveItemDownTheHeap();
    maxHeap.heapArr.should.to.eql(result1);
  });
  it("it should check if item got added to max heap", function () {
    let maxHeap = new MaxHeap();
    maxHeap.heapArr = [2, 3, 4, 5, 6, 7];
    maxHeap.addToHeap(8);
    let result1 = [8, 3, 2, 5, 6, 7, 4];
    maxHeap.heapArr.should.to.eql(result1);
  });
  it("it should check if root item got extracted from the max heap", function () {
    let maxHeap = new MaxHeap();
    maxHeap.heapArr = [8, 6, 5, 4, 3, 2, 7];
    let root = maxHeap.extractRoot();
    let result1 = [7, 6, 5, 4, 3, 2];
    maxHeap.heapArr.should.to.eql(result1);
    root.should.equal(8);
  });
});

let datasets = [];
let dataset1 = [],
  dataset2 = [],
  dataset3 = [],
  dataset4 = [],
  dataset5 = [],
  dataset6 = [];
let length = 101;

for (let i = 1; i <= length; i++) {
  dataset1.push(i); //Numbers in ascending order
  dataset2.push(length - i); //number in descending order
  dataset3.push(i / 2); //float numbers
  dataset4.push(Math.random()); //random numbers
  dataset5.push(parseFloat(Math.random() * 1000));
  dataset6.push(11); //same bumber
}

datasets = [dataset1, dataset2, dataset3, dataset4, dataset5, dataset6];

describe("StatsCollector", function () {
  datasets.forEach(function (dataset, idx) {
    it(
      "it should calculate the median for Dataset: " + (idx + 1).toString(),
      function () {
        let statsCollector = new StatsCollector();
        dataset.forEach(function (item) {
          statsCollector.pushValue(item);
        });
        true.should.equal(statsCollector.getMedian() == math.median(dataset));
      }
    );
  });

  datasets.forEach(function (dataset, idx) {
    it(
      "it should calculate the average for Dataset: " + (idx + 1).toString(),
      function () {
        //true.should.equal(true);
        let statsCollector = new StatsCollector();
        dataset.forEach(function (item) {
          statsCollector.pushValue(item);
        });
        true.should.equal(statsCollector.getAverage() == math.mean(dataset));
      }
    );
  });
});

// Run all our test suites.  Only necessary in the browser.
mocha.run();
