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

  /**
   * 修改自身promise的状态为
   * @param value
   */

  resolve(value) {
    if (this.status !== 'pendding') return;
    this.status = "fufilled";
    this.value = value;  // 这里的value可能是Promise,也可能是值,先按照值来处理
    console.log('执行resolve方法', value);
    this.noticeChange();
  }

  reject(value) {
    if (this.status !== 'pendding') return;
    this.status = "rejected";
    this.value = value;  // 这里的value可能是异常,所以先按照值来处理
    console.log('执行reject方法', value);
    this.noticeChange();
  }

  /**
   * 执行回调函数
   */
  noticeChange() {
    if (this.status === 'pending') return;
    setTimeout(function () {
      while(this.funcCacheList.length) {
        const needProcessed = this.funcCacheList.splice(0, 1)[0];

        const { onResolve, onRej, resolve, reject } = needProcessed;
        if (this.status === 'fufilled') {
          try {
            if (typeof onResolve === 'function') {
              const value = onResolve(this.value);
              resolve(value);
              return;
            }
            resolve(this.value);
          } catch(e) {
            reject(e);
          }
        }

        if (this.status === 'rejected') {
          try {
            if (typeof onRej === 'function') {
              const value = onRej(this.value);
              reject(value);
              return;
            }
            reject(this.value);
          } catch(e) {
            reject(e);
          }
        }
      }
    }.bind(this), 1);

  }


  then(onResolve, onRej) {
    const that = this;
    return new FakePromise(function (resolve, reject) {
      // 只能先将resolve rej给缓存下来
      that.funcCacheList.push({
        onResolve,
        onRej,
        resolve,
        reject,
      });
      that.noticeChange();
    });

  }

  catch(rej) {
    return this.then(null, rej);
  }
}

const mPromise = new FakePromise((res, rej) => {
  res(10);
}).then(() => {
  console.log('执行我自己的then方法')
}).catch(() => {
  console.log('执行catch方法')
});