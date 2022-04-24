export class Benchmark {
  static execute(BenchmarkClass) {
    if (!BenchmarkClass) {
      return;
    }

    BenchmarkClass.execute();
  }
}