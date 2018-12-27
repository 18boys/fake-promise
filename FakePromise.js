/**
 * @file FakePromise
 * @author shuai.li
 */
class FakePromise {
  constructor(initFunc) {
    this.status = "pendding";
    this.resolve = this.resolve.bind(this);// 为什么这个地方拿不到this
    this.reject = this.reject.bind(this);// 为什么这个地方拿不到this
    initFunc(this.resolve, this.reject);
  }

  resolve(value) {
    if (this.status !== 'pendding') return;
    this.status = "fufilled";
    console.log(value);
  }

  reject(value) {
    if (this.status !== 'pendding') return;
    this.status = "rejected";
    console.log(value);
  }
}

const mPromise = new FakePromise((res, rej) => {
  res(10);
});