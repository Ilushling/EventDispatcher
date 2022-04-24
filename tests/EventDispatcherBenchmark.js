import { EventDispatcher } from '../src/EventDispatcher.js';

export class EventDispatcherBenchmark {
  static execute() {
    this.eventDispatcher = new EventDispatcher();

    const measures = {
      test1: []
    };

    this.commonValue = 0;

    // Warm js optimizations
    this.test(5, false);
    this.eventDispatcher.clear();

    const measuresCount = 1;
    const iterationsCount = 40000;

    for (let i = 0; i < measuresCount; i++) {
      const start = performance.now();
      this.test({ count: iterationsCount, isLog: false });
      const end = performance.now();

      measures.test1.push(end - start);
    }
    measures.test1 = measures.test1.reduce((acc, measure) => acc + measure, 0);
    console.log(measures.test1);

    console.log(measures);
  }

  static test({ count = 1000, isLog = false }) {
    if (isLog) {
      console.time('all');
    }
  
    if (isLog) {
      console.time('register');
    }
    for (let i = 0; i < count; i++) {
      this.eventDispatcher.addEventListener('test1', data1 => {
        //commonValue += data1.value;
      });
      this.eventDispatcher.addEventListener('test2', data2 => {
        //commonValue += data2.value;
      });
      this.eventDispatcher.once('test3', data3 => {
        //commonValue += data3.value;
      });
    }
    if (isLog) {
      console.timeEnd('register');
    }
  
    if (isLog) {
      console.time('dispatch');
    }
    for (let i = 0; i < count; i++) {
      // this.eventDispatcher.dispatchEvent('test1', { value: i });
      // this.eventDispatcher.dispatchEvent('test2', { value: i });
      this.eventDispatcher.once('test3', data3 => {
        //commonValue += data3.value;
      });
      this.eventDispatcher.dispatchEvent('test3', { value: i });
    }
    if (isLog) {
      console.timeEnd('dispatch');
    }
  
    if (isLog) {
      console.timeEnd('all');
    }
  }
}