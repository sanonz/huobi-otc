import Popup from './providers/Popup';


const popup = new Popup();
popup.appendTo(document.getElementById('app-root'));

if(process.env.NODE_ENV !== 'production') {
  (window as any).popup = popup;
}
