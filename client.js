const query = QUERY;
const src = SIGNAL_SRC;
let version = window.location.search.slice(1).split("&").find(str=>str.startsWith(query));
if (version) version = version.split("=")[1];
setInterval(()=>{
    const script = document.createElement('script');
    script.src = src;
    if (window.location.search.startsWith("?")) {
        if (!version) window.location = window.location.protocol + '//' + window.location.pathname + window.location.search + "&" + query + "=0";
    } else window.location = window.location.protocol + '//' + window.location.pathname + "?" + query + "=0";
    document.children[0].append(script);
    script.onload = ()=>{
        if (Number(version) === window[query]) return;
        if (window.location.search) {
            const search = window.location.search.slice(1).split("&").reduce((pv, cv)=>{
                if (cv.startsWith(query)) return pv;
                pv += cv;
                return pv;
            }, '');
            window.location = window.location.protocol + '//' + window.location.pathname + "?" + query + "=" + window[query] + (search ? "&" + search : '');
        }
        else window.location = window.location.protocol + '//' + window.location.pathname + "?" + query + "=" + window[query];
    }
    script.remove();
}, 1000);
