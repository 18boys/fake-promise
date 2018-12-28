/**
 * @file FakePromise
 * @author shuai.li
 */
class FakePromise {
  constructor(initFunc) {
    this.status = "pendding";
    this.value = '';
    this.funcCacheList = []; // 不能缓存很多 只需要缓存自己的就行 以及下一个promise的句柄
    this.resolve = this.resolve.bind(this);// 为什么这个地方拿不到this
    this.reject = this.reject.bind(this);// 为什么这个地方拿不到this 是因为在initFunc中执行的原因?
    this.then = this.then.bind(this);// 为什么这个地方拿不到this 是因为在initFunc中执行的原因?
    this.catch = this.catch.bind(this);// 为什么这个地方拿不到this 是因为在initFunc中执行的原因?
    initFunc(this.resolve, this.reject);
  }

  resolve(value) {
    if (this.status !== 'pendding') return;
    this.status = "fufilled";
    this.value = value;  // 这里的value可能是异常,所以先按照值来处理
    console.log(value);

    // 必须手动才能执行then catch方法
    if (this.funcCacheList.length === 0) {
      // return new FakePromise(function (res, rej) {
      //   res();
      // });
      // 上面会导致死循环
      // return new this.constructor(function (res, rej) {
      //   res();
      // });
      // 上面会导致死循环
      return;
    }

    const needProcessFuncObj = this.funcCacheList.splice(0, 1);
    if (needProcessFuncObj.resolve) {
      if (typeof needProcessFuncObj.resolve === 'function') needProcessFuncObj.resolve(); // 这个地方有问题 违反了智能改变一次状态的问题
    }
  }

  reject(value) {
    if (this.status !== 'pendding') return;
    this.status = "rejected";
    this.value = value;  // 这里的value可能是异常,所以先按照值来处理
    console.log(value);

    // 必须手动才能执行then catch方法
    if (this.funcCacheList.length === 0) {
      return new FakePromise(function (res, rej) {
        res();
      });
    }

    const needProcessFuncObj = this.funcCacheList.splice(0, 1);
    if (needProcessFuncObj.rej) {
      if (typeof needProcessFuncObj.rej === 'function') needProcessFuncObj.rej(); // 这个地方有问题 违反了智能改变一次状态的问题
    }
  }

  then(resolve, rej) {
    // 只能先将resolve rej给缓存下来
    this.funcCacheList.push({
      resolve,
      rej,
    });
    return this;  // 这里返回this 有问题,但是如果返回一个新的promise的话(为了给一个value status为初始状态的promise) 怎么接受到所有的then catch方法呢?

    // let r = '';
    // if (this.status === 'fufilled') {
    //   r = resolve();
    // }
    //
    // if (this.status === 'rejected') {
    //   r = rej();
    // }
    // 根据 r的不同类型返回不同的值
    // r是promise  就直接返回r
    // r是值就包装成 resolve的promise
    // 这里为了简单,首先按照value来处理
    // return new FakePromise(initFunc);
  }

  catch(rej) {
    const nullFunc = function () {};
    return this.then(null, rej);
  }
}

const mPromise = new FakePromise((res, rej) => {
  res(10);
}).then(() => {
  console.log('执行then方法')
}).catch(() => {
  console.log('执行catch方法')
});