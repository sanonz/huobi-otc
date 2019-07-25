addCustomEvent('notify', function(evt: CustomEvent<number>): void {
  const orderId = evt.detail;
  const a: any = document.querySelector('.order-footer a');
  if (a && orderId) {
    if (a.__vue__) {
      a.__vue__.$router.push(`/zh-cn/tradeInfo/?order=${orderId}`);
    } else if (a.onclick) {
      a.onclick();
    }
  }
});


function addCustomEvent<T>(type: string, listener: (evt: CustomEvent<T>) => void) {
  document.addEventListener(`otc.${type}`, listener as EventListener);
}
