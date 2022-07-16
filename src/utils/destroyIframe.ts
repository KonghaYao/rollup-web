/* 移除 Iframe 元素 */
export function destroyIframe(iframe: HTMLIFrameElement) {
    //把iframe指向空白页面，这样可以释放大部分内存。
    iframe.src = "about:blank";

    try {
        iframe.contentWindow?.document.write("");
        iframe.contentWindow?.document.clear();
    } catch (e) {}

    //把iframe从页面移除
    iframe.parentNode?.removeChild(iframe);
}
