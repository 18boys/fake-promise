/**
 * @file FakePromise
 * @author shuai.li
 */
class FakePromise {
  constructor(initFunc) {
    this.status = "pendding";
    this.value = '';
    this.funcCacheList = [];
    this.resolve = this.resolve.bind(this);
    this.reject = this.reject.bind(this);
    this.then = this.then.bind(this);
    this.catch = this.catch.bind(this);

    try {
      initFunc(this.resolve, this.reject);
    } catch(e) {
      this.reject(e)
    }

  }

  /**
   * 修改自身promise的状态为
   * @param value
   */

  resolve(value) {
    if (this.status !== 'pendding') return;
    this.status = "fufilled";

    const isPromiseObject = value && value.then;
    if (!isPromiseObject) {
      this.value = value;
      this.noticeChange();
    } else {
      // 如果是类promise对象
      try {
        value.then(function (v) {
          this.value = v;
          this.noticeChange();
        }.bind(this))
      } catch(e) {
        this.reject(e)
      }

    }

  }

  reject(value) {
    if (this.status !== 'pendding') return;
    this.status = "rejected";
    this.value = value;
    this.noticeChange();
  }

  /**
   * 执行回调函数
   */
  noticeChange() {
    if (this.status === 'pending') return;
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

const myPromise = new FakePromise((res) => {
  throw new Error();
  // res(23)
})
const mPromise = new FakePromise((res, rej) => {
  res(myPromise);
}).then((v) => {
  console.log('执行我自己的then方法', v, myPromise)
}).catch(() => {
  console.log('执行catch方法')
});