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

//JSFiddle Code : https://jsfiddle.net/rachhek/Ldh2osb4/

"use strict";

// Stat collector
class StatsCollector {
  constructor(/*void*/) {
    this.responseArr = [];
    this.responseTimeOut = 19000;
  }

  pushValue(responseTimeMs /*number*/) /*void*/ {
    this.responseArr.push(responseTimeMs);
  }

  getMedian() /*number*/ {
    let medianCalculator = new MedianCalculator(
      this.responseArr,
      1,
      this.responseTimeOut
    );
    let median = medianCalculator.calculate();
    return median;
  }

  getAverage() /*number*/ {
    let total = 0;
    this.responseArr.forEach(function (item) {
      total += item;
    });
    return parseFloat(total / this.responseArr.length);
  }
}

class MedianCalculator {
  constructor(responseArray, minVal, maxVal) {
    this.responseArr = responseArray;
    this.minVal = minVal;
    this.maxVal = maxVal; //this is the responseTimeOut length
  }

  calculate() {
    let binsArr = this.getBins(this.minVal, this.maxVal);
    let freqArr = this.calculateFrequencies(binsArr, this.responseArr);
    let cumulativeArr = this.calculateCumulative(freqArr);
    let midVal = Math.ceil(this.responseArr.length / 2);
    let medianIdx = this.findMedianIdx(midVal, cumulativeArr);
    let median = this.getMedian(binsArr, cumulativeArr);
    return median;
  }

  //calculate the 'bins' for every possible response time
  getBins(min, max) {
    let result = [];
    for (var i = min; i <= max; i++) result.push(i);
    return result;
  }

  //get median
  getMedian(binsArr, cumulativeArr) {
    let length = cumulativeArr[cumulativeArr.length - 1];
    //if the length of the responses is odd
    if (length % 2 != 0) {
      let midVal = Math.ceil(length / 2);
      let medianIdx = this.findMedianIdx(midVal, cumulativeArr);
      return binsArr[medianIdx];
    } else {
      //if the length of the responses is even
      let midVal1 = length / 2;
      let midVal2 = midVal1 + 1;
      let medianIdx1 = this.findMedianIdx(midVal1, cumulativeArr);
      let medianIdx2 = this.findMedianIdx(midVal2, cumulativeArr);
      let median = (binsArr[medianIdx1] + binsArr[medianIdx2]) / 2;
      return median;
    }
  }

  // Find the index where the median lies by looking through the cumulative frequency array
  // performance can be improved by applying binary search
  findMedianIdx(value, cumulativeArr) {
    for (var i = 0; i <= cumulativeArr.length; i++) {
      if (parseInt(value) <= cumulativeArr[i]) {
        let medianIdx = i;
        return medianIdx;
      }
    }
  }

  // find which bin the current value lies in
  findBinIdx(value, binEdges) {
    for (var i = 0; i < binEdges.length; i++) {
      if (value < parseInt(binEdges[i])) {
        return i - 1;
      }
    }
  }

  //Calculate the frequency array
  calculateFrequencies(bins, values) {
    //make an empty array of same size as the bins
    let freqArr = bins.map((x) => {
      return 0;
    });

    //loop through all the values and keep counter
    values.forEach((value) => {
      let binIdx = this.findBinIdx(value, bins);
      freqArr[binIdx] += 1;
    });
    return freqArr;
  }

  //calculate the cumulative frequency
  calculateCumulative(frequencies) {
    let y = 0;
    let cumsum = frequencies.map((d) => (y += d));
    return cumsum;
  }
}

//Test purposes

//function to get random number within a range for test purposes
function getRandomInt(min, max) {
  return parseInt(Math.random() * (max - min) + min);
}

let datasets = [];
let dataset1 = [],
  dataset2 = [],
  dataset3 = [],
  dataset4 = [];
let datasetLength = 1000; //length of dataset
let responseTimeOut = 19000; // max response timeout

for (let i = 1; i < datasetLength; i++) {
  dataset1.push(getRandomInt(1, responseTimeOut)); // to be sorted in ascending order
  dataset2.push(getRandomInt(1, responseTimeOut)); //to be sorted in descending order
  dataset3.push(getRandomInt(1, responseTimeOut)); // no sorting
  dataset4.push(500); //same repeating number
}

datasets = [
  dataset1.sort(),
  dataset2.sort(function (a, b) {
    return b - a;
  }),
  dataset3,
  dataset4,
];

// Configure Mocha, telling both it and chai to use BDD-style tests.
mocha.setup("bdd");
chai.should();

describe("StatsCollector", function () {
  //loop through all the test datasets and calculate the median for each
  //compare the median with the median calculated from math.min.js library

  datasets.forEach(function (dataset, idx) {
    it(
      "it should calculate the median for Dataset: " + (idx + 1).toString(),
      function () {
        let statsCollector = new StatsCollector();
        dataset.forEach(function (item) {
          statsCollector.pushValue(item);
        });
        let median = statsCollector.getMedian();

        //use of math.min.js library to calculate the median
        median.should.equal(math.median(dataset));
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

        //use of math.min.js library to calculate the mean
        true.should.equal(statsCollector.getAverage() == math.mean(dataset));
      }
    );
  });
});

// Run all our test suites.  Only necessary in the browser.
mocha.run();
