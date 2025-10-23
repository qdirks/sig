(()=>{
    if (window.location.protocol !== 'file:') return;
    const query = QUERY;
    const src = SIGNAL_SRC;
    let version = window.location.search.slice(1).split("&").find(str=>str.startsWith(query));
    if (version) version = version.split("=")[1];
    const iframe = document.createElement('iframe');
    iframe.addEventListener('load', ()=>{
        const win = iframe.contentWindow;
        setInterval(()=>{
            const script = win.document.createElement('script');
            script.src = src;
            if (window.location.search.startsWith("?")) {
                if (!version) {
                    window.location = window.location.protocol + '//' + window.location.pathname + window.location.search + "&" + query + "=0";
                }
            } else window.location = window.location.protocol + '//' + window.location.pathname + "?" + query + "=0";
            win.document.body.append(script);
            script.onload = ()=>{
                script.onload = undefined;
                if (Number(version) === win[query]) return;
                if (window.location.search) {
                    const search = window.location.search.slice(1).split("&").reduce((pv, cv)=>{
                        if (cv.startsWith(query)) return pv;
                        pv += cv;
                        return pv;
                    }, '');
                    window.location = window.location.protocol + '//' + window.location.pathname + "?" + query + "=" + win[query] + (search ? "&" + search : '');
                }
                else window.location = window.location.protocol + '//' + window.location.pathname + "?" + query + "=" + win[query];
            }
            script.remove();
        }, 1000);
    });
    iframe.style.display = 'none';
    document.head.append(iframe);
})();