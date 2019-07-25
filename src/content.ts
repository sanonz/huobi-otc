import Content from './providers/Content';


injectScript(chrome.extension.getURL('assets/js/inject.js'));

function injectScript(src: string) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = src;
  document.head.appendChild(script);
  script.parentNode!.removeChild(script);
}

(window as any).content = new Content();
