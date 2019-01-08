/**
 * @file FakePromise
 * @author shuai.li
 */
class FakePromise {
  static resolve() {
    return new FakePromise((res) => {
      res();
    })
  }

  static reject() {
    return new FakePromise((res, rej) => {
      rej();
    })
  }

  constructor(initFunc) {
    this.status = "pendding";
    this.value = '';
    this.funcCacheList = [];
    this.mResolve = this.mResolve.bind(this);
    this.mReject = this.mReject.bind(this);
    this.then = this.then.bind(this);
    this.catch = this.catch.bind(this);

    try {
      initFunc(this.mResolve, this.mReject);
    } catch(e) {
      this.mReject(e)
    }

  }

  /**
   * 修改自身promise的状态为
   * @param value
   */

  mResolve(value) {
    if (this.status !== 'pendding') return;
    const isPromiseObject = value && value.then;
    if (!isPromiseObject) {
      this.status = 'fufilled';
      this.value = value;
      this.noticeChange();
      return;
    }
    // 如果是类promise对象
    try {
      value.then((v) => {
        this.status = 'fufilled';
        this.value = v;
        this.noticeChange();
      }, (reason) => {
        this.mReject(reason)
      })
    } catch(e) {
      this.mReject(e)
    }
  }

  mReject(value) {
    if (this.status !== 'pendding') return;
    this.status = 'rejected';
    this.value = value;
    this.noticeChange();
  }

  /**
   * 执行回调函数
   * 根据规范,必须异步调用回调
   */
  noticeChange() {
    if (this.status === 'pending') return;
    const that = this;
    setTimeout(() => {
      while(that.funcCacheList.length) {
        const needProcessed = that.funcCacheList.splice(0, 1)[0];
        const { onResolve, onRej, resolve, reject } = needProcessed;
        if (that.status === 'fufilled') {
          try {
            if (typeof onResolve === 'function') {
              const value = onResolve(that.value);
              resolve(value);
              return;
            }
            resolve(that.value);
          } catch(e) {
            reject(e);
          }
        }

        if (this.status === 'rejected') {
          try {
            if (typeof onRej === 'function') {
              const value = onRej(this.value);
              resolve(value); // 特别注意
              return;
            }
            reject(this.value);
          } catch(e) {
            reject(e);
          }
        }
      }
    }, 0)

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
});
const mPromise = new FakePromise((res, rej) => {
  res(myPromise);
}).then((v) => {
  console.log('执行我自己的then方法', v)
}).catch(() => {
  console.log('执行catch方法')
});

FakePromise.resolve()
  .then(() => {
    console.log('进入FakePromise.resolve的resolve')
  })
  .catch(() => {
    console.log('进入FakePromise.resolve的catch')
  });


FakePromise.reject()
  .then(() => {
    console.log('进入FakePromise.reject的resolve')
  })
  .catch(() => {
    console.log('进入FakePromise.reject的catch')
  });

