(function() {
  const attr = 'cz-shortcut-listen';
  const removeAttr = () => {
    if (document.body && document.body.hasAttribute(attr)) {
      document.body.removeAttribute(attr);
    }
  };
  removeAttr();
  const observer = new MutationObserver(removeAttr);
  observer.observe(document.documentElement, { attributes: true, subtree: true });
})();
