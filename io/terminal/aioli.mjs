const r = Symbol("Comlink.proxy"), H = Symbol("Comlink.endpoint"), C = Symbol("Comlink.releaseProxy"), y = Symbol("Comlink.thrown"), Y = (l) => typeof l == "object" && l !== null || typeof l == "function", k = {
  canHandle: (l) => Y(l) && l[r],
  serialize(l) {
    const { port1: c, port2: b } = new MessageChannel();
    return R(l, c), [b, [b]];
  },
  deserialize(l) {
    return l.start(), K(l);
  }
}, I = {
  canHandle: (l) => Y(l) && y in l,
  serialize({ value: l }) {
    let c;
    return l instanceof Error ? c = {
      isError: !0,
      value: {
        message: l.message,
        name: l.name,
        stack: l.stack
      }
    } : c = { isError: !1, value: l }, [c, []];
  },
  deserialize(l) {
    throw l.isError ? Object.assign(new Error(l.value.message), l.value) : l.value;
  }
}, S = /* @__PURE__ */ new Map([
  ["proxy", k],
  ["throw", I]
]);
function R(l, c = self) {
  c.addEventListener("message", function b(t) {
    if (!t || !t.data)
      return;
    const { id: i, type: e, path: Z } = Object.assign({ path: [] }, t.data), d = (t.data.argumentList || []).map(u);
    let m;
    try {
      const n = Z.slice(0, -1).reduce((s, p) => s[p], l), a = Z.reduce((s, p) => s[p], l);
      switch (e) {
        case "GET":
          m = a;
          break;
        case "SET":
          n[Z.slice(-1)[0]] = u(t.data.value), m = !0;
          break;
        case "APPLY":
          m = a.apply(n, d);
          break;
        case "CONSTRUCT":
          {
            const s = new a(...d);
            m = z(s);
          }
          break;
        case "ENDPOINT":
          {
            const { port1: s, port2: p } = new MessageChannel();
            R(l, p), m = U(s, [s]);
          }
          break;
        case "RELEASE":
          m = void 0;
          break;
        default:
          return;
      }
    } catch (n) {
      m = { value: n, [y]: 0 };
    }
    Promise.resolve(m).catch((n) => ({ value: n, [y]: 0 })).then((n) => {
      const [a, s] = o(n);
      c.postMessage(Object.assign(Object.assign({}, a), { id: i }), s), e === "RELEASE" && (c.removeEventListener("message", b), V(c));
    });
  }), c.start && c.start();
}
function N(l) {
  return l.constructor.name === "MessagePort";
}
function V(l) {
  N(l) && l.close();
}
function K(l, c) {
  return X(l, [], c);
}
function h(l) {
  if (l)
    throw new Error("Proxy has been released and is not useable");
}
function X(l, c = [], b = function() {
}) {
  let t = !1;
  const i = new Proxy(b, {
    get(e, Z) {
      if (h(t), Z === C)
        return () => G(l, {
          type: "RELEASE",
          path: c.map((d) => d.toString())
        }).then(() => {
          V(l), t = !0;
        });
      if (Z === "then") {
        if (c.length === 0)
          return { then: () => i };
        const d = G(l, {
          type: "GET",
          path: c.map((m) => m.toString())
        }).then(u);
        return d.then.bind(d);
      }
      return X(l, [...c, Z]);
    },
    set(e, Z, d) {
      h(t);
      const [m, n] = o(d);
      return G(l, {
        type: "SET",
        path: [...c, Z].map((a) => a.toString()),
        value: m
      }, n).then(u);
    },
    apply(e, Z, d) {
      h(t);
      const m = c[c.length - 1];
      if (m === H)
        return G(l, {
          type: "ENDPOINT"
        }).then(u);
      if (m === "bind")
        return X(l, c.slice(0, -1));
      const [n, a] = W(d);
      return G(l, {
        type: "APPLY",
        path: c.map((s) => s.toString()),
        argumentList: n
      }, a).then(u);
    },
    construct(e, Z) {
      h(t);
      const [d, m] = W(Z);
      return G(l, {
        type: "CONSTRUCT",
        path: c.map((n) => n.toString()),
        argumentList: d
      }, m).then(u);
    }
  });
  return i;
}
function J(l) {
  return Array.prototype.concat.apply([], l);
}
function W(l) {
  const c = l.map(o);
  return [c.map((b) => b[0]), J(c.map((b) => b[1]))];
}
const g = /* @__PURE__ */ new WeakMap();
function U(l, c) {
  return g.set(l, c), l;
}
function z(l) {
  return Object.assign(l, { [r]: !0 });
}
function o(l) {
  for (const [c, b] of S)
    if (b.canHandle(l)) {
      const [t, i] = b.serialize(l);
      return [
        {
          type: "HANDLER",
          name: c,
          value: t
        },
        i
      ];
    }
  return [
    {
      type: "RAW",
      value: l
    },
    g.get(l) || []
  ];
}
function u(l) {
  switch (l.type) {
    case "HANDLER":
      return S.get(l.name).deserialize(l.value);
    case "RAW":
      return l.value;
  }
}
function G(l, c, b) {
  return new Promise((t) => {
    const i = T();
    l.addEventListener("message", function e(Z) {
      !Z.data || !Z.data.id || Z.data.id !== i || (l.removeEventListener("message", e), t(Z.data));
    }), l.start && l.start(), l.postMessage(Object.assign({ id: i }, c), b);
  });
}
function T() {
  return new Array(4).fill(0).map(() => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16)).join("-");
}
const x = "KGZ1bmN0aW9uKCl7InVzZSBzdHJpY3QiO2NvbnN0ICQ9U3ltYm9sKCJDb21saW5rLnByb3h5IiksQT1TeW1ib2woIkNvbWxpbmsuZW5kcG9pbnQiKSxSPVN5bWJvbCgiQ29tbGluay5yZWxlYXNlUHJveHkiKSx5PVN5bWJvbCgiQ29tbGluay50aHJvd24iKSxfPWU9PnR5cGVvZiBlPT0ib2JqZWN0IiYmZSE9PW51bGx8fHR5cGVvZiBlPT0iZnVuY3Rpb24iLEw9e2NhbkhhbmRsZTplPT5fKGUpJiZlWyRdLHNlcmlhbGl6ZShlKXtjb25zdHtwb3J0MTpyLHBvcnQyOml9PW5ldyBNZXNzYWdlQ2hhbm5lbDtyZXR1cm4gdyhlLHIpLFtpLFtpXV19LGRlc2VyaWFsaXplKGUpe3JldHVybiBlLnN0YXJ0KCksQyhlKX19LE89e2NhbkhhbmRsZTplPT5fKGUpJiZ5IGluIGUsc2VyaWFsaXplKHt2YWx1ZTplfSl7bGV0IHI7cmV0dXJuIGUgaW5zdGFuY2VvZiBFcnJvcj9yPXtpc0Vycm9yOiEwLHZhbHVlOnttZXNzYWdlOmUubWVzc2FnZSxuYW1lOmUubmFtZSxzdGFjazplLnN0YWNrfX06cj17aXNFcnJvcjohMSx2YWx1ZTplfSxbcixbXV19LGRlc2VyaWFsaXplKGUpe3Rocm93IGUuaXNFcnJvcj9PYmplY3QuYXNzaWduKG5ldyBFcnJvcihlLnZhbHVlLm1lc3NhZ2UpLGUudmFsdWUpOmUudmFsdWV9fSxFPW5ldyBNYXAoW1sicHJveHkiLExdLFsidGhyb3ciLE9dXSk7ZnVuY3Rpb24gdyhlLHI9c2VsZil7ci5hZGRFdmVudExpc3RlbmVyKCJtZXNzYWdlIixmdW5jdGlvbiBpKHMpe2lmKCFzfHwhcy5kYXRhKXJldHVybjtjb25zdHtpZDpvLHR5cGU6YSxwYXRoOm59PU9iamVjdC5hc3NpZ24oe3BhdGg6W119LHMuZGF0YSksdT0ocy5kYXRhLmFyZ3VtZW50TGlzdHx8W10pLm1hcChtKTtsZXQgbDt0cnl7Y29uc3QgYz1uLnNsaWNlKDAsLTEpLnJlZHVjZSgoZCxoKT0+ZFtoXSxlKSxmPW4ucmVkdWNlKChkLGgpPT5kW2hdLGUpO3N3aXRjaChhKXtjYXNlIkdFVCI6bD1mO2JyZWFrO2Nhc2UiU0VUIjpjW24uc2xpY2UoLTEpWzBdXT1tKHMuZGF0YS52YWx1ZSksbD0hMDticmVhaztjYXNlIkFQUExZIjpsPWYuYXBwbHkoYyx1KTticmVhaztjYXNlIkNPTlNUUlVDVCI6e2NvbnN0IGQ9bmV3IGYoLi4udSk7bD16KGQpfWJyZWFrO2Nhc2UiRU5EUE9JTlQiOntjb25zdHtwb3J0MTpkLHBvcnQyOmh9PW5ldyBNZXNzYWdlQ2hhbm5lbDt3KGUsaCksbD1OKGQsW2RdKX1icmVhaztjYXNlIlJFTEVBU0UiOmw9dm9pZCAwO2JyZWFrO2RlZmF1bHQ6cmV0dXJufX1jYXRjaChjKXtsPXt2YWx1ZTpjLFt5XTowfX1Qcm9taXNlLnJlc29sdmUobCkuY2F0Y2goYz0+KHt2YWx1ZTpjLFt5XTowfSkpLnRoZW4oYz0+e2NvbnN0W2YsZF09UyhjKTtyLnBvc3RNZXNzYWdlKE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSxmKSx7aWQ6b30pLGQpLGE9PT0iUkVMRUFTRSImJihyLnJlbW92ZUV2ZW50TGlzdGVuZXIoIm1lc3NhZ2UiLGkpLEYocikpfSl9KSxyLnN0YXJ0JiZyLnN0YXJ0KCl9ZnVuY3Rpb24gVChlKXtyZXR1cm4gZS5jb25zdHJ1Y3Rvci5uYW1lPT09Ik1lc3NhZ2VQb3J0In1mdW5jdGlvbiBGKGUpe1QoZSkmJmUuY2xvc2UoKX1mdW5jdGlvbiBDKGUscil7cmV0dXJuIGIoZSxbXSxyKX1mdW5jdGlvbiBwKGUpe2lmKGUpdGhyb3cgbmV3IEVycm9yKCJQcm94eSBoYXMgYmVlbiByZWxlYXNlZCBhbmQgaXMgbm90IHVzZWFibGUiKX1mdW5jdGlvbiBiKGUscj1bXSxpPWZ1bmN0aW9uKCl7fSl7bGV0IHM9ITE7Y29uc3Qgbz1uZXcgUHJveHkoaSx7Z2V0KGEsbil7aWYocChzKSxuPT09UilyZXR1cm4oKT0+ZyhlLHt0eXBlOiJSRUxFQVNFIixwYXRoOnIubWFwKHU9PnUudG9TdHJpbmcoKSl9KS50aGVuKCgpPT57RihlKSxzPSEwfSk7aWYobj09PSJ0aGVuIil7aWYoci5sZW5ndGg9PT0wKXJldHVybnt0aGVuOigpPT5vfTtjb25zdCB1PWcoZSx7dHlwZToiR0VUIixwYXRoOnIubWFwKGw9PmwudG9TdHJpbmcoKSl9KS50aGVuKG0pO3JldHVybiB1LnRoZW4uYmluZCh1KX1yZXR1cm4gYihlLFsuLi5yLG5dKX0sc2V0KGEsbix1KXtwKHMpO2NvbnN0W2wsY109Uyh1KTtyZXR1cm4gZyhlLHt0eXBlOiJTRVQiLHBhdGg6Wy4uLnIsbl0ubWFwKGY9PmYudG9TdHJpbmcoKSksdmFsdWU6bH0sYykudGhlbihtKX0sYXBwbHkoYSxuLHUpe3Aocyk7Y29uc3QgbD1yW3IubGVuZ3RoLTFdO2lmKGw9PT1BKXJldHVybiBnKGUse3R5cGU6IkVORFBPSU5UIn0pLnRoZW4obSk7aWYobD09PSJiaW5kIilyZXR1cm4gYihlLHIuc2xpY2UoMCwtMSkpO2NvbnN0W2MsZl09TSh1KTtyZXR1cm4gZyhlLHt0eXBlOiJBUFBMWSIscGF0aDpyLm1hcChkPT5kLnRvU3RyaW5nKCkpLGFyZ3VtZW50TGlzdDpjfSxmKS50aGVuKG0pfSxjb25zdHJ1Y3QoYSxuKXtwKHMpO2NvbnN0W3UsbF09TShuKTtyZXR1cm4gZyhlLHt0eXBlOiJDT05TVFJVQ1QiLHBhdGg6ci5tYXAoYz0+Yy50b1N0cmluZygpKSxhcmd1bWVudExpc3Q6dX0sbCkudGhlbihtKX19KTtyZXR1cm4gb31mdW5jdGlvbiBEKGUpe3JldHVybiBBcnJheS5wcm90b3R5cGUuY29uY2F0LmFwcGx5KFtdLGUpfWZ1bmN0aW9uIE0oZSl7Y29uc3Qgcj1lLm1hcChTKTtyZXR1cm5bci5tYXAoaT0+aVswXSksRChyLm1hcChpPT5pWzFdKSldfWNvbnN0IFA9bmV3IFdlYWtNYXA7ZnVuY3Rpb24gTihlLHIpe3JldHVybiBQLnNldChlLHIpLGV9ZnVuY3Rpb24geihlKXtyZXR1cm4gT2JqZWN0LmFzc2lnbihlLHtbJF06ITB9KX1mdW5jdGlvbiBTKGUpe2Zvcihjb25zdFtyLGldb2YgRSlpZihpLmNhbkhhbmRsZShlKSl7Y29uc3RbcyxvXT1pLnNlcmlhbGl6ZShlKTtyZXR1cm5be3R5cGU6IkhBTkRMRVIiLG5hbWU6cix2YWx1ZTpzfSxvXX1yZXR1cm5be3R5cGU6IlJBVyIsdmFsdWU6ZX0sUC5nZXQoZSl8fFtdXX1mdW5jdGlvbiBtKGUpe3N3aXRjaChlLnR5cGUpe2Nhc2UiSEFORExFUiI6cmV0dXJuIEUuZ2V0KGUubmFtZSkuZGVzZXJpYWxpemUoZS52YWx1ZSk7Y2FzZSJSQVciOnJldHVybiBlLnZhbHVlfX1mdW5jdGlvbiBnKGUscixpKXtyZXR1cm4gbmV3IFByb21pc2Uocz0+e2NvbnN0IG89VSgpO2UuYWRkRXZlbnRMaXN0ZW5lcigibWVzc2FnZSIsZnVuY3Rpb24gYShuKXshbi5kYXRhfHwhbi5kYXRhLmlkfHxuLmRhdGEuaWQhPT1vfHwoZS5yZW1vdmVFdmVudExpc3RlbmVyKCJtZXNzYWdlIixhKSxzKG4uZGF0YSkpfSksZS5zdGFydCYmZS5zdGFydCgpLGUucG9zdE1lc3NhZ2UoT2JqZWN0LmFzc2lnbih7aWQ6b30sciksaSl9KX1mdW5jdGlvbiBVKCl7cmV0dXJuIG5ldyBBcnJheSg0KS5maWxsKDApLm1hcCgoKT0+TWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKk51bWJlci5NQVhfU0FGRV9JTlRFR0VSKS50b1N0cmluZygxNikpLmpvaW4oIi0iKX1jb25zdCBXPWFzeW5jKCk9PldlYkFzc2VtYmx5LnZhbGlkYXRlKG5ldyBVaW50OEFycmF5KFswLDk3LDExNSwxMDksMSwwLDAsMCwxLDUsMSw5NiwwLDEsMTIzLDMsMiwxLDAsMTAsMTAsMSw4LDAsNjUsMCwyNTMsMTUsMjUzLDk4LDExXSkpLHg9ImVhZ2VyIixrPSJsYXp5IixqPXtzc3c6WyJzaW1kIl0sbWluaW1hcDI6WyJzaW1kIl19LHQ9e3Rvb2xzOltdLGNvbmZpZzp7fSxmaWxlczpbXSxiYXNlOnt9LGZzOnt9LGFzeW5jIGluaXQoKXtpZih0LnRvb2xzLmxlbmd0aD09PTApdGhyb3ciRXhwZWN0aW5nIGF0IGxlYXN0IDEgdG9vbC4iO2lmKG5ldyBTZXQodC50b29scy5tYXAocj0+YCR7ci50b29sfS8ke3IucHJvZ3JhbXx8ci50b29sfWApKS5zaXplIT09dC50b29scy5sZW5ndGgpdGhyb3ciRm91bmQgZHVwbGljYXRlIHRvb2xzOyBjYW4gb25seSBoYXZlIGVhY2ggdG9vbC9wcm9ncmFtIGNvbWJpbmF0aW9uIGF0IG1vc3Qgb25jZS4iO2lmKHQuYmFzZT10LnRvb2xzLmZpbmQocj0+ci5yZWluaXQhPT0hMCksIXQuYmFzZSl0aHJvdyJDb3VsZCBub3QgZmluZCBhIHRvb2wgd2l0aCBgcmVpbml0OiBmYWxzZWAgdG8gdXNlIGFzIHRoZSBiYXNlIG1vZHVsZS4gVG8gZml4IHRoaXMgaXNzdWUsIGluY2x1ZGUgdGhlIHRvb2wgYGJhc2UvMS4wLjBgIHdoZW4gaW5pdGlhbGl6aW5nIEFpb2xpLiI7cmV0dXJuIHQuYmFzZS5pc0Jhc2VNb2R1bGU9ITAsYXdhaXQgdGhpcy5fc2V0dXAodC5iYXNlKSxhd2FpdCB0aGlzLl9pbml0TW9kdWxlcygpLHQuX2xvZygiUmVhZHkiKSwhMH0sYXN5bmMgX2luaXRNb2R1bGVzKCl7YXdhaXQgUHJvbWlzZS5hbGwodC50b29scy5tYXAodGhpcy5fc2V0dXApKSxhd2FpdCB0aGlzLl9zZXR1cEZTKCl9LG1vdW50KGU9W10pe2NvbnN0IHI9YCR7dC5jb25maWcuZGlyU2hhcmVkfSR7dC5jb25maWcuZGlyRGF0YX1gLGk9YCR7dC5jb25maWcuZGlyU2hhcmVkfSR7dC5jb25maWcuZGlyTW91bnRlZH1gO2xldCBzPVtdLG89W10sYT1bXTshQXJyYXkuaXNBcnJheShlKSYmIShlIGluc3RhbmNlb2YgRmlsZUxpc3QpJiYoZT1bZV0pLHQuX2xvZyhgTW91bnRpbmcgJHtlLmxlbmd0aH0gZmlsZXNgKTtmb3IobGV0IG4gb2YgZSl7aWYobiBpbnN0YW5jZW9mIEZpbGV8fChuPT1udWxsP3ZvaWQgMDpuLmRhdGEpaW5zdGFuY2VvZiBCbG9iJiZuLm5hbWV8fHR5cGVvZihuPT1udWxsP3ZvaWQgMDpuLmRhdGEpPT0ic3RyaW5nIiYmbi5uYW1lKXR5cGVvZihuPT1udWxsP3ZvaWQgMDpuLmRhdGEpPT0ic3RyaW5nIiYmKG4uZGF0YT1uZXcgQmxvYihbbi5kYXRhXSx7dHlwZToidGV4dC9wbGFpbiJ9KSkscy5wdXNoKG4pO2Vsc2UgaWYobi5uYW1lJiZuLnVybClvLnB1c2gobik7ZWxzZSBpZih0eXBlb2Ygbj09InN0cmluZyImJm4uc3RhcnRzV2l0aCgiaHR0cCIpKW49e3VybDpuLG5hbWU6bi5zcGxpdCgiLy8iKS5wb3AoKS5yZXBsYWNlKC9cLy9nLCItIil9LG8ucHVzaChuKTtlbHNlIHRocm93J0Nhbm5vdCBtb3VudCBmaWxlKHMpIHNwZWNpZmllZC4gTXVzdCBiZSBhIEZpbGUsIEJsb2IsIGEgVVJMIHN0cmluZywgb3IgeyBuYW1lOiAiZmlsZS50eHQiLCBkYXRhOiAic3RyaW5nIiB9Lic7YS5wdXNoKG4ubmFtZSl9dHJ5e3QuZnMudW5tb3VudChpKX1jYXRjaHt9Zm9yKGxldCBuIG9mIG8pdC5mcy5jcmVhdGVMYXp5RmlsZShyLG4ubmFtZSxuLnVybCwhMCwhMCk7cmV0dXJuIHQuZmlsZXM9dC5maWxlcy5jb25jYXQocyksdC5iYXNlLm1vZHVsZS5GUy5tb3VudCh0LmJhc2UubW9kdWxlLldPUktFUkZTLHtmaWxlczp0LmZpbGVzLmZpbHRlcihuPT5uIGluc3RhbmNlb2YgRmlsZSksYmxvYnM6dC5maWxlcy5maWx0ZXIobj0+KG49PW51bGw/dm9pZCAwOm4uZGF0YSlpbnN0YW5jZW9mIEJsb2IpfSxpKSxzLm1hcChuPT57Y29uc3QgdT1gJHtpfS8ke24ubmFtZX1gLGw9YCR7cn0vJHtuLm5hbWV9YDt0cnl7dC5mcy51bmxpbmsobCl9Y2F0Y2h7fXQuX2xvZyhgQ3JlYXRpbmcgc3ltbGluazogJHtsfSAtLT4gJHt1fWApLHQuZnMuc3ltbGluayh1LGwpfSksYS5tYXAobj0+YCR7cn0vJHtufWApfSxhc3luYyBleGVjKGUscj1udWxsKXtpZih0Ll9sb2coYEV4ZWN1dGluZyAlYyR7ZX0lYyBhcmdzPSR7cn1gLCJjb2xvcjpkYXJrYmx1ZTsgZm9udC13ZWlnaHQ6Ym9sZCIsIiIpLCFlKXRocm93IkV4cGVjdGluZyBhIGNvbW1hbmQiO2xldCBpPWU7cj09bnVsbCYmKHI9ZS5zcGxpdCgiICIpLGk9ci5zaGlmdCgpKTtjb25zdCBzPXQudG9vbHMuZmluZChhPT57dmFyIHU7bGV0IG49aTtyZXR1cm4oKHU9YT09bnVsbD92b2lkIDA6YS5mZWF0dXJlcyk9PW51bGw/dm9pZCAwOnUuc2ltZCk9PT0hMCYmKG49YCR7bn0tc2ltZGApLGEucHJvZ3JhbT09bn0pO2lmKHM9PW51bGwpdGhyb3dgUHJvZ3JhbSAke2l9IG5vdCBmb3VuZC5gO3Muc3Rkb3V0PSIiLHMuc3RkZXJyPSIiLHMubG9hZGluZz09ayYmKHMubG9hZGluZz14LGF3YWl0IHRoaXMuX2luaXRNb2R1bGVzKCkpO3RyeXtzLm1vZHVsZS5jYWxsTWFpbihyKX1jYXRjaChhKXtjb25zb2xlLmVycm9yKGEpfXRyeXtzLm1vZHVsZS5GUy5jbG9zZShzLm1vZHVsZS5GUy5zdHJlYW1zWzFdKSxzLm1vZHVsZS5GUy5jbG9zZShzLm1vZHVsZS5GUy5zdHJlYW1zWzJdKX1jYXRjaHt9cy5tb2R1bGUuRlMuc3RyZWFtc1sxXT1zLm1vZHVsZS5GUy5vcGVuKCIvZGV2L3N0ZG91dCIsInciKSxzLm1vZHVsZS5GUy5zdHJlYW1zWzJdPXMubW9kdWxlLkZTLm9wZW4oIi9kZXYvc3RkZXJyIiwidyIpO2xldCBvPXtzdGRvdXQ6cy5zdGRvdXQsc3RkZXJyOnMuc3RkZXJyfTtpZih0LmNvbmZpZy5wcmludEludGVybGVhdmVkJiYobz1zLnN0ZG91dCkscy5yZWluaXQ9PT0hMCl7Y29uc3QgYT10LmJhc2UubW9kdWxlLkZTLmN3ZCgpO09iamVjdC5hc3NpZ24ocyxzLmNvbmZpZykscy5yZWFkeT0hMSxhd2FpdCB0aGlzLmluaXQoKSxzLmlzQmFzZU1vZHVsZSYmdGhpcy5tb3VudCgpLHRoaXMuY2QoYSl9cmV0dXJuIG99LGNhdChlKXtyZXR1cm4gdC5fZmlsZW9wKCJjYXQiLGUpfSxscyhlKXtyZXR1cm4gdC5fZmlsZW9wKCJscyIsZSl9LGRvd25sb2FkKGUpe3JldHVybiB0Ll9maWxlb3AoImRvd25sb2FkIixlKX0scHdkKCl7cmV0dXJuIHQuZnMuY3dkKCl9LGNkKGUpe2ZvcihsZXQgciBvZiB0LnRvb2xzKSFyLm1vZHVsZXx8ci5tb2R1bGUuRlMuY2hkaXIoZSl9LG1rZGlyKGUpe3JldHVybiB0LmZzLm1rZGlyKGUpLCEwfSxyZWFkKHtwYXRoOmUsbGVuZ3RoOnIsZmxhZzppPSJyIixvZmZzZXQ6cz0wLHBvc2l0aW9uOm89MH0pe2NvbnN0IGE9dC5mcy5vcGVuKGUsaSksbj1uZXcgVWludDhBcnJheShyKTtyZXR1cm4gdC5mcy5yZWFkKGEsbixzLHIsbyksdC5mcy5jbG9zZShhKSxufSx3cml0ZSh7cGF0aDplLGJ1ZmZlcjpyLGZsYWc6aT0idysiLG9mZnNldDpzPTAscG9zaXRpb246bz0wfSl7Y29uc3QgYT10LmZzLm9wZW4oZSxpKTt0LmZzLndyaXRlKGEscixzLHIubGVuZ3RoLG8pLHQuZnMuY2xvc2UoYSl9LF9zdGRpblR4dDoiIixfc3RkaW5QdHI6MCxnZXQgc3RkaW4oKXtyZXR1cm4gdC5fc3RkaW5UeHR9LHNldCBzdGRpbihlPSIiKXt0Ll9sb2coYFNldHRpbmcgc3RkaW4gdG8gJWMke2V9JWNgLCJjb2xvcjpkYXJrYmx1ZSIsIiIpLHQuX3N0ZGluVHh0PWUsdC5fc3RkaW5QdHI9MH0sYXN5bmMgX3NldHVwKGUpe2lmKGUucmVhZHkpcmV0dXJuO2lmKHQuX2xvZyhgU2V0dGluZyB1cCAke2UudG9vbH0gKGJhc2UgPSAke2UuaXNCYXNlTW9kdWxlPT09ITB9KS4uLmApLGUuY29uZmlnPU9iamVjdC5hc3NpZ24oe30sZSksZS51cmxQcmVmaXh8fChlLnVybFByZWZpeD1gJHt0LmNvbmZpZy51cmxDRE59LyR7ZS50b29sfS8ke2UudmVyc2lvbn1gKSxlLnByb2dyYW18fChlLnByb2dyYW09ZS50b29sKSxlLmZlYXR1cmVzfHwoZS5mZWF0dXJlcz17fSwoaltlLnByb2dyYW1dfHxbXSkuaW5jbHVkZXMoInNpbWQiKSYmKGF3YWl0IFcoKT8oZS5wcm9ncmFtKz0iLXNpbWQiLGUuZmVhdHVyZXMuc2ltZD0hMCk6dC5fbG9nKGBXZWJBc3NlbWJseSBTSU1EIGlzIG5vdCBzdXBwb3J0ZWQgaW4gdGhpcyBicm93c2VyOyB3aWxsIGxvYWQgbm9uLVNJTUQgdmVyc2lvbiBvZiAke2UucHJvZ3JhbX0uYCkpKSxlLmlzQmFzZU1vZHVsZSYmKGUubG9hZGluZz14KSxlLmxvYWRpbmc9PT1rKXt0Ll9sb2coYFdpbGwgbGF6eS1sb2FkICR7ZS50b29sfTsgc2tpcHBpbmcgaW5pdGlhbGl6YXRpb24uYCk7cmV0dXJufXNlbGYuaW1wb3J0U2NyaXB0cyhgJHtlLnVybFByZWZpeH0vJHtlLnByb2dyYW19LmpzYCksZS5tb2R1bGU9YXdhaXQgTW9kdWxlKHt0aGlzUHJvZ3JhbTplLnByb2dyYW0sbG9jYXRlRmlsZTooaSxzKT0+YCR7ZS51cmxQcmVmaXh9LyR7aX1gLHN0ZGluOigpPT50Ll9zdGRpblB0cjx0LnN0ZGluLmxlbmd0aD90LnN0ZGluLmNoYXJDb2RlQXQodC5fc3RkaW5QdHIrKyk6KHQuc3RkaW49IiIsbnVsbCkscHJpbnQ6aT0+ZS5zdGRvdXQrPWAke2l9CmAscHJpbnRFcnI6dC5jb25maWcucHJpbnRJbnRlcmxlYXZlZD9pPT5lLnN0ZG91dCs9YCR7aX0KYDppPT5lLnN0ZGVycis9YCR7aX0KYH0pO2NvbnN0IHI9ZS5tb2R1bGUuRlM7ZS5pc0Jhc2VNb2R1bGU/KHQuX2xvZyhgU2V0dGluZyB1cCAke2UudG9vbH0gd2l0aCBiYXNlIG1vZHVsZSBmaWxlc3lzdGVtLi4uYCksci5ta2Rpcih0LmNvbmZpZy5kaXJTaGFyZWQsNTExKSxyLm1rZGlyKGAke3QuY29uZmlnLmRpclNoYXJlZH0vJHt0LmNvbmZpZy5kaXJEYXRhfWAsNTExKSxyLm1rZGlyKGAke3QuY29uZmlnLmRpclNoYXJlZH0vJHt0LmNvbmZpZy5kaXJNb3VudGVkfWAsNTExKSxyLmNoZGlyKGAke3QuY29uZmlnLmRpclNoYXJlZH0vJHt0LmNvbmZpZy5kaXJEYXRhfWApLHQuZnM9cik6KHQuX2xvZyhgU2V0dGluZyB1cCAke2UudG9vbH0gd2l0aCBmaWxlc3lzdGVtLi4uYCksci5ta2Rpcih0LmNvbmZpZy5kaXJTaGFyZWQpLHIubW91bnQoZS5tb2R1bGUuUFJPWFlGUyx7cm9vdDp0LmNvbmZpZy5kaXJTaGFyZWQsZnM6dC5mc30sdC5jb25maWcuZGlyU2hhcmVkKSxyLmNoZGlyKHQuZnMuY3dkKCkpKSxlLnN0ZG91dD0iIixlLnN0ZGVycj0iIixlLnJlYWR5PSEwfSxhc3luYyBfc2V0dXBGUygpe2NvbnN0IGU9dC5mcztmb3IobGV0IHIgb2YgdC50b29scyl7aWYoIXIucmVhZHkpY29udGludWU7Y29uc3QgaT1yLm1vZHVsZS5GUyxzPWAvJHtyLnRvb2x9YCxvPWAke3QuY29uZmlnLmRpclNoYXJlZH0ke3N9YDshaS5hbmFseXplUGF0aChzKS5leGlzdHN8fGUuYW5hbHl6ZVBhdGgobykuZXhpc3RzfHwodC5fbG9nKGBNb3VudGluZyAke3N9IG9udG8gJHt0LmJhc2UudG9vbH0gZmlsZXN5c3RlbSBhdCAke299YCksZS5ta2RpcihvKSxlLm1vdW50KHQuYmFzZS5tb2R1bGUuUFJPWFlGUyx7cm9vdDpzLGZzOml9LG8pKX19LF9maWxlb3AoZSxyKXt0Ll9sb2coYFJ1bm5pbmcgJHtlfSAke3J9YCk7Y29uc3QgaT10LmZzLmFuYWx5emVQYXRoKHIpO2lmKCFpLmV4aXN0cylyZXR1cm4gdC5fbG9nKGBGaWxlICR7cn0gbm90IGZvdW5kLmApLCExO3N3aXRjaChlKXtjYXNlImNhdCI6cmV0dXJuIHQuZnMucmVhZEZpbGUocix7ZW5jb2Rpbmc6InV0ZjgifSk7Y2FzZSJscyI6cmV0dXJuIHQuZnMuaXNGaWxlKGkub2JqZWN0Lm1vZGUpP3QuZnMuc3RhdChyKTp0LmZzLnJlYWRkaXIocik7Y2FzZSJkb3dubG9hZCI6Y29uc3Qgcz1uZXcgQmxvYihbdGhpcy5jYXQocildKTtyZXR1cm4gVVJMLmNyZWF0ZU9iamVjdFVSTChzKX1yZXR1cm4hMX0sX2xvZyhlKXtpZighdC5jb25maWcuZGVidWcpcmV0dXJuO2xldCByPVsuLi5hcmd1bWVudHNdO3Iuc2hpZnQoKSxjb25zb2xlLmxvZyhgJWNbV2ViV29ya2VyXSVjICR7ZX1gLCJmb250LXdlaWdodDpib2xkIiwiIiwuLi5yKX19O3codCl9KSgpOwo=", L = typeof window < "u" && window.Blob && new Blob([atob(x)], { type: "text/javascript;charset=utf-8" });
function v() {
  const l = L && (window.URL || window.webkitURL).createObjectURL(L);
  try {
    return l ? new Worker(l) : new Worker("data:application/javascript;base64," + x);
  } finally {
    l && (window.URL || window.webkitURL).revokeObjectURL(l);
  }
}
const f = "https://biowasm.com/cdn/v3", F = "https://stg.biowasm.com/cdn/v3", w = {
  urlCDN: f,
  urlCDNStg: F,
  dirShared: "/shared",
  dirMounted: "/mnt",
  dirData: "/data",
  printInterleaved: !0,
  callback: null,
  debug: !1,
  env: "prd"
};
class B {
  constructor(c, b = {}) {
    if (c == null)
      throw "Expecting array of tools as input to Aioli constructor.";
    return Array.isArray(c) || (c = [c]), b = Object.assign({}, w, b), c = c.map(this._parseTool), b.env === "stg" && (b.urlCDN = b.urlCDNStg), this.tools = c, this.config = b, this.config.callback != null && (this.callback = this.config.callback), delete this.config.callback, this.init();
  }
  async init() {
    const c = new v();
    this.callback && (c.onmessage = (t) => {
      t.data.type === "biowasm" && this.callback(t.data.value);
    });
    const b = K(c);
    return b.tools = this.tools, b.config = this.config, await b.init(), b;
  }
  _parseTool(c) {
    if (typeof c != "string")
      return c;
    const b = c.split("/");
    if (b.length != 2 && b.length != 3)
      throw "Expecting '<tool>/<version>' or '<tool>/<program>/<version>'";
    return {
      tool: b[0],
      program: b.length == 3 ? b[1] : b[0],
      version: b[b.length - 1]
    };
  }
}
export {
  B as default
};
