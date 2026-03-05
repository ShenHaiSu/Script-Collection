(() => {
  const getFrameworkInfo = () => {
    // 1. Vue 检测
    // Vue 3 及其以上版本
    if (window.__VUE__) {
      return `vue3`; 
    }
    // Vue 2 探测 (通常在 window.Vue 上)
    if (window.Vue) {
      const version = window.Vue.version;
      return version ? `vue${version.split('.')[0]}` : 'vue2';
    }
    // 针对部分不暴露全局 Vue 的情况，检查根节点标识
    if (document.querySelector('[__vue__]')) {
      return 'vue2';
    }

    // 2. React 检测
    // 现代 React (16+) 通常会在 DOM 节点上附加以 __react 开头的属性
    const rootNodes = document.querySelectorAll('*');
    for (let node of rootNodes) {
      const keys = Object.keys(node);
      const reactKey = keys.find(key => key.startsWith('__reactContainer') || key.startsWith('__reactFiber'));
      if (reactKey) {
        // 通过内部属性尝试获取版本，若获取不到则返回大版本特征
        const internalInstance = node[reactKey];
        if (reactKey.startsWith('__reactContainer')) {
          return 'react16+'; // 包含 16, 17, 18+
        }
      }
    }
    // 较老版本的 React (15及以下)
    if (document.querySelector('[data-reactroot]')) {
      return 'react15';
    }

    // 3. Angular 检测
    if (window.ng && window.ng.probe) {
      return 'angular';
    }
    if (document.querySelector('[ng-version]')) {
        const version = document.querySelector('[ng-version]').getAttribute('ng-version');
        return `angular${version.split('.')[0]}`;
    }

    // 4. 其他框架简易检测
    if (window.jQuery && window.jQuery.fn && window.jQuery.fn.jquery) {
      return `jquery${window.jQuery.fn.jquery.split('.')[0]}`;
    }

    return "";
  };

  const result = getFrameworkInfo();
  console.log("%c检测结果:", "color: #42b983; font-weight: bold;", result || "未匹配到主流框架");
  return result;
})();