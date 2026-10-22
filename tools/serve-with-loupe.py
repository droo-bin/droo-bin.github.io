#!/usr/bin/env python3
"""Preview the blog with Loupe charts working, as they will on GitHub Pages.

On GitHub Pages the blog and Loupe share one address (droo-bin.github.io and droo-bin.github.io/loupe/),
which is what lets Loupe read the blog's /data/ files. Run locally on two ports they count as different
sites, so this puts both behind one address:

    http://localhost:8080/          -> the blog (Jekyll, default http://localhost:4000)
    http://localhost:8080/loupe/    -> Loupe    (default http://localhost:8000, e.g. `npm run serve`)

Start Jekyll and Loupe first, then:

    python3 tools/serve-with-loupe.py [--port 8080] [--site http://localhost:4000] [--loupe http://localhost:8000]

Python 3 only, nothing to install.
"""
import argparse
import http.server
import urllib.error
import urllib.request

HOP = {"connection", "keep-alive", "transfer-encoding", "te", "trailer", "upgrade", "proxy-authenticate", "proxy-authorization", "content-encoding", "content-length"}


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a, **k):
        return None  # pass redirects (/blog -> /blog/) back to the browser


opener = urllib.request.build_opener(NoRedirect)


class Proxy(http.server.BaseHTTPRequestHandler):
    site = loupe = ""

    def do_GET(self):
        self.forward()

    def do_HEAD(self):
        self.forward(body=False)

    def forward(self, body=True):
        if self.path == "/loupe" or self.path.startswith("/loupe?"):
            self.send_response(301)
            self.send_header("Location", "/loupe/" + self.path[len("/loupe"):])
            self.end_headers()
            return
        if self.path.startswith("/loupe/"):
            target, prefix = self.loupe + self.path[len("/loupe"):], "/loupe"
        else:
            target, prefix = self.site + self.path, ""
        headers = {k: v for k, v in self.headers.items() if k.lower() not in HOP and k.lower() != "host"}
        req = urllib.request.Request(target, headers=headers, method="HEAD" if not body else "GET")
        try:
            res = opener.open(req, timeout=60)
        except urllib.error.HTTPError as e:
            res = e
        except urllib.error.URLError as e:
            which = "Loupe" if prefix else "the blog"
            msg = f"Couldn't reach {which} at {target.split('/', 3)[:3][-1]}: {e.reason}. Is it running?".encode()
            self.send_response(502)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.send_header("Content-Length", str(len(msg)))
            self.end_headers()
            self.wfile.write(msg)
            return
        data = res.read() if body else b""
        self.send_response(res.status if hasattr(res, "status") else res.code)
        for k, v in res.headers.items():
            if k.lower() in HOP:
                continue
            if k.lower() == "location" and prefix and v.startswith("/"):
                v = prefix + v  # keep Loupe's own redirects inside /loupe/
            self.send_header(k, v)
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        if body:
            self.wfile.write(data)

    def log_message(self, fmt, *args):
        if args and str(args[1])[0] in "45":
            super().log_message(fmt, *args)


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--port", type=int, default=8080)
    ap.add_argument("--site", default="http://localhost:4000")
    ap.add_argument("--loupe", default="http://localhost:8000")
    a = ap.parse_args()
    Proxy.site, Proxy.loupe = a.site.rstrip("/"), a.loupe.rstrip("/")
    server = http.server.ThreadingHTTPServer(("127.0.0.1", a.port), Proxy)
    print(f"Blog with Loupe: http://localhost:{a.port}/  (Loupe at http://localhost:{a.port}/loupe/)")
    print(f"  blog from {Proxy.site}, Loupe from {Proxy.loupe}. Ctrl+C to stop.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
