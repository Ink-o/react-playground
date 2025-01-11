const remotesMap = {
  'mf_test':{
    url: 'http://localhost:3000/remoteEntry.js',
    format: 'var',
    from: 'webpack'
  }
};
const loadJS = async (url, fn) => {
  const resolvedUrl = typeof url === 'function' ? await url() : url;
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.onload = fn;
  script.src = resolvedUrl;
  document.getElementsByTagName('head')[0].appendChild(script);
};
  
function merge(obj1, obj2) {
  const mergedObj = Object.assign(obj1, obj2);
  for (const key of Object.keys(mergedObj)) {
    // 嵌套对象内部属性合并
    if (typeof mergedObj[key] === 'object' && typeof obj2[key] === 'object') {
      mergedObj[key] = merge(mergedObj[key], obj2[key]);
    }
  }
  return mergedObj;
}

const wrapShareModule = remoteFrom => {
  // 分享模块
  return merge({}, (globalThis.__federation_shared__ || {})['default'] || {});
};

async function __federation_method_ensure(remoteId) {
  const remote = remotesMap[remoteId];
  // 未初始化成功
  if (!remote.inited) {
      // var 模式 
      if ('var' === remote.format) {
          // loading js with script tag
          return new Promise(resolve => {
              const callback = () => {
                  if (!remote.inited) {
                      remote.lib = window[remoteId];
                      // 应该是webpack内部的初始化方法，传的是来源
                      remote.lib.init(wrapShareModule(remote.from));
                      remote.inited = true;
                  }
                  resolve(remote.lib);
              };
              // 加载远程资源后，将挂载的变量挂载到 lib 变量上
              return loadJS(remote.url, callback);
          });
      } else if (['esm', 'systemjs'].includes(remote.format)) { // esm 模式
          // loading js with import(...)
          return new Promise((resolve, reject) => {
              const getUrl = typeof remote.url === 'function' ? remote.url : () => Promise.resolve(remote.url);
              getUrl().then(url => {
                  import(/* @vite-ignore */ url).then(lib => {
                      if (!remote.inited) {
                          const shareScope = wrapShareModule(remote.from);
                          lib.init(shareScope);
                          remote.lib = lib;
                          remote.lib.init(shareScope);
                          remote.inited = true;
                      }
                      resolve(remote.lib);
                  }).catch(reject);
              });
          })
      }
  } else {
    return remote.lib;
  }
}

function __federation_method_unwrapDefault(module) {
  return (module?.__esModule || module?.[Symbol.toStringTag] === 'Module') ? module.default : module
}

function __federation_method_getRemote(remoteName, componentName) {
  return __federation_method_ensure(remoteName).then((remote) => remote.get(componentName).then(factory => factory()));
}

// const ButtonA = await __federation_method_getRemote("mf_test" , "./Button")
// const Button = __federation_method_unwrapDefault(ButtonA)