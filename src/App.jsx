import { ChevronDown } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Checkbox } from "./components/ui/checkbox";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Select } from "./components/ui/select";
import { Textarea } from "./components/ui/textarea";

const THEO_LIVE_API_TOKEN = import.meta.env.VITE_THEO_LIVE_API_TOKEN?.trim() || "";
const THEOPLAYER_LICENSE = import.meta.env.VITE_THEOPLAYER_LICENSE?.trim() || "";

const TEMPLATES = {
  unified: {
    label: "Unified Streaming demo",
    adsHost: "dev.perf.theoads.live",
    streamId1: "jedd-demo-stream-101",
    streamId2: "jedd-demo-stream-102",
    manifestPath: "k8s/live/stable/live.isml/.m3u8",
    networkCode: "23285652104",
    assetKey1: "xnappet_pool_v2_01",
    assetKey2: "xnappet_pool_v2_01",
    adUnit1: "",
    adUnit2: "",
    layout: "",
    originUrl: "https://demo.unified-streaming.com",
    segOrigin: "https://demo.unified-streaming.com/k8s/live/stable/live.isml/.m3u8",
    adPlaylistUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    breakDuration: 15,
    backdropURI: "https://testing.theo.live/theoads/THEOads_double_box.png",
  },
  optiviewHls: {
    label: "OptiView HLS demo",
    adsHost: "dev.perf.theoads.live",
    streamId1: "optiview-hls-demo-stream-403",
    streamId2: "optiview-hls-demo-stream-404",
    manifestPath:
      "v2/aws-production-eu-west-1/e2c4220c-3cf4-4499-ab3a-ea5e904d0406/da8001d5-3788-40b4-8a08-63c382c6b58f/demo/hls/main.m3u8",
    networkCode: "23285652104",
    assetKey1: "xnappet_pool_v2_01",
    assetKey2: "xnappet_pool_v2_01",
    adUnit1: "",
    adUnit2: "",
    layout: "",
    originUrl: "https://fastly.cdn.theo.live",
    segOrigin: "https://fastly.cdn.theo.live",
    adPlaylistUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    breakDuration: 15,
    backdropURI: "https://testing.theo.live/theoads/THEOads_double_box.png",
  },
  custom: {
    label: "Custom",
  },
};

const defaultConfig = {
  template: "optiviewHls",
  adsHost: TEMPLATES.optiviewHls.adsHost,
  streamId1: TEMPLATES.optiviewHls.streamId1,
  streamId2: TEMPLATES.optiviewHls.streamId2,
  manifestPath: TEMPLATES.optiviewHls.manifestPath,
  networkCode: TEMPLATES.optiviewHls.networkCode,
  assetKey1: TEMPLATES.optiviewHls.assetKey1,
  assetKey2: TEMPLATES.optiviewHls.assetKey2,
  adUnit1: TEMPLATES.optiviewHls.adUnit1,
  adUnit2: TEMPLATES.optiviewHls.adUnit2,
  layout: TEMPLATES.optiviewHls.layout,
  originUrl: TEMPLATES.optiviewHls.originUrl,
  segOrigin: TEMPLATES.optiviewHls.segOrigin,
  adPlaylistUrl: TEMPLATES.optiviewHls.adPlaylistUrl,
  breakDuration: String(TEMPLATES.optiviewHls.breakDuration),
  backdropUri: TEMPLATES.optiviewHls.backdropURI,
  extraFieldsJson: "",
  includeLayout: true,
  includeOrigin: true,
  includeSegmentOrigin: true,
  includeBackdrop: true,
};

function bumpSuffixValue(value) {
  const trimmed = value.trim();
  const match = trimmed.match(/^(.*?)(\d+)$/);

  if (match) {
    return `${match[1]}${parseInt(match[2], 10) + 1}`;
  }

  if (trimmed) {
    return `${trimmed}-1`;
  }

  return "test-1";
}

function Field({ id, label, value, onChange, type = "text", placeholder, canIncrement }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex gap-2">
        <Input
          id={id}
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
        {canIncrement ? (
          <Button type="button" variant="outline" size="sm" className="h-10 px-3" onClick={() => onChange(bumpSuffixValue(value))}>
            +1
          </Button>
        ) : null}
      </div>
    </div>
  );
}

const AD_LAYOUTS = [
  ["SINGLE", "Single"],
  ["DOUBLE", "Double"],
  ["LSHAPE_AD", "L Ad"],
  ["LSHAPE_CONTENT", "L Content"],
];

function PlayerCard({ title, status, containerRef, onSchedule, countdown }) {
  return (
    <Card className="self-start overflow-hidden shadow-sm">
      <CardHeader className="flex-row items-center justify-between space-y-0 p-3 pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        {status ? <Badge variant="secondary">{status}</Badge> : null}
      </CardHeader>
      <CardContent className="grid grid-cols-[120px_minmax(0,1fr)] items-stretch gap-2 p-3 pt-0">
        <div className="grid h-full grid-rows-4 gap-2">
          {AD_LAYOUTS.map(([layout, label]) => {
            const hasCountdown = Boolean(countdown);
            const isActive = countdown?.layout === layout;
            return (
              <Button
                key={layout}
                className="relative h-full overflow-hidden disabled:opacity-100"
                variant="outline"
                disabled={hasCountdown}
                onClick={() => onSchedule(layout)}
              >
                {isActive ? (
                  <span
                    className="absolute inset-y-0 left-0 bg-primary/20 transition-[width] duration-300 ease-linear"
                    style={{ width: `${countdown.progress}%` }}
                  />
                ) : null}
                <span className="relative z-10 flex flex-col leading-tight">
                  <span>{label}</span>
                  {isActive ? <span className="text-[10px] font-normal text-muted-foreground">Ad starts in {countdown.remainingSeconds}s</span> : null}
                </span>
              </Button>
            );
          })}
        </div>
        <div
          ref={containerRef}
          className="min-w-0 overflow-hidden rounded-md border bg-black shadow-sm theoplayer-container video-js theoplayer-skin vjs-16-9"
        />
      </CardContent>
    </Card>
  );
}

export default function App() {
  const [config, setConfig] = useState(defaultConfig);
  const [logText, setLogText] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [status, setStatus] = useState("");
  const [countdowns, setCountdowns] = useState({ 1: null, 2: null });

  const configRef = useRef(config);
  const player1ContainerRef = useRef(null);
  const player2ContainerRef = useRef(null);
  const player1Ref = useRef(null);
  const player2Ref = useRef(null);
  const countdownTimersRef = useRef({ 1: null, 2: null });
  const playerRecreateTimerRef = useRef(null);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  const setConfigField = useCallback((field, value) => {
    setConfig((previous) => ({ ...previous, [field]: value }));
  }, []);

  const log = useCallback((title, payload) => {
    const time = new Date().toISOString();
    const json = typeof payload === "string" ? payload : JSON.stringify(payload, null, 2);
    setLogText((previous) => `${previous}\n\n[${time}] ${title}\n${json}`);
  }, []);

  const getStreamId = useCallback((which, sourceConfig = configRef.current) => {
    return (which === 1 ? sourceConfig.streamId1 : sourceConfig.streamId2).trim();
  }, []);

  const getAssetKey = useCallback((which, sourceConfig = configRef.current) => {
    return (which === 1 ? sourceConfig.assetKey1 : sourceConfig.assetKey2).trim();
  }, []);

  const getAdUnit = useCallback((which, sourceConfig = configRef.current) => {
    return (which === 1 ? sourceConfig.adUnit1 : sourceConfig.adUnit2).trim();
  }, []);

  const currentSourceSrc = useCallback((which, sourceConfig = configRef.current) => {
    const host = sourceConfig.adsHost.trim();
    const manifestPath = sourceConfig.manifestPath.trim();
    const streamId = getStreamId(which, sourceConfig);
    return `https://${host}/signaling-service/api/v1/${streamId}/hls/${manifestPath}`;
  }, [getStreamId]);

  const setPlayerSource = useCallback((instance, which, sourceConfig = configRef.current) => {
    const playerInstance = instance || (which === 1 ? player1Ref.current : player2Ref.current);
    if (!playerInstance) return;

    const src = currentSourceSrc(which, sourceConfig);
    const networkCode = sourceConfig.networkCode.trim();
    const customAssetKey = getAssetKey(which, sourceConfig);
    const adUnit = getAdUnit(which, sourceConfig);
    const iu = adUnit ? `/${networkCode}/${adUnit}` : `/${networkCode}/`;
    const source = {
      sources: {
        src,
        type: "application/x-mpegurl",
        hlsDateRange: true,
      },
    };

    source.ads = [
      {
        integration: "theoads",
        networkCode,
        customAssetKey,
        adTagParameters: { iu },
      },
    ];

    playerInstance.source = source;

    log("Player source set", {
      player: which,
      src,
      networkCode,
      customAssetKey,
      iu,
    });
  }, [currentSourceSrc, getAdUnit, getAssetKey, log]);

  const destroyPlayer = useCallback((which) => {
    const instance = which === 1 ? player1Ref.current : player2Ref.current;

    if (instance?.destroy) {
      try {
        instance.destroy();
      } catch (error) {
        console.error(error);
      }
    }

    if (which === 1) {
      player1Ref.current = null;
      if (player1ContainerRef.current) player1ContainerRef.current.innerHTML = "";
    } else {
      player2Ref.current = null;
      if (player2ContainerRef.current) player2ContainerRef.current.innerHTML = "";
    }
  }, []);

  const createPlayer = useCallback((which) => {
    const container = which === 1 ? player1ContainerRef.current : player2ContainerRef.current;
    if (!container || !window.THEOplayer?.Player) return;

    if (!THEOPLAYER_LICENSE) {
      log("Configuration error", "VITE_THEOPLAYER_LICENSE is required.");
      setStatus("THEOplayer license missing");
      return;
    }

    destroyPlayer(which);

    const instance = new window.THEOplayer.Player(container, {
      libraryLocation: "/theoplayer",
      license: THEOPLAYER_LICENSE,
      ads: { theoads: true },
    });

    instance.muted = true;
    instance.autoplay = true;
    instance.addEventListener("adbreakbegin", (event) => {
      log(`adbreakbegin (player ${which})`, event);
    });

    if (which === 1) {
      player1Ref.current = instance;
    } else {
      player2Ref.current = instance;
    }

    setPlayerSource(instance, which);
    setStatus(`Player ${which} ready.`);
    window.setTimeout(() => setStatus(""), 2000);
  }, [destroyPlayer, log, setPlayerSource]);

  const applyTemplate = useCallback((name) => {
    const template = TEMPLATES[name];
    if (!template) return;

    if (name === "custom") {
      setConfigField("template", "custom");
      log("Template", "Switched to custom (no automatic changes).");
      return;
    }

    const nextConfig = {
      ...configRef.current,
      template: name,
      adsHost: template.adsHost,
      streamId1: template.streamId1,
      streamId2: template.streamId2,
      manifestPath: template.manifestPath,
      networkCode: template.networkCode,
      assetKey1: template.assetKey1,
      assetKey2: template.assetKey2,
      adUnit1: template.adUnit1,
      adUnit2: template.adUnit2,
      layout: template.layout,
      originUrl: template.originUrl,
      segOrigin: template.segOrigin,
      adPlaylistUrl: template.adPlaylistUrl,
      breakDuration: String(template.breakDuration),
      backdropUri: template.backdropURI,
      extraFieldsJson: "",
    };

    configRef.current = nextConfig;
    setConfig(nextConfig);
    log("Template applied", template);

    if (playerRecreateTimerRef.current) {
      window.clearTimeout(playerRecreateTimerRef.current);
    }

    destroyPlayer(1);
    destroyPlayer(2);
    playerRecreateTimerRef.current = window.setTimeout(() => {
      playerRecreateTimerRef.current = null;
      createPlayer(1);
      createPlayer(2);
    }, 0);
  }, [createPlayer, destroyPlayer, log, setConfigField]);

  const apiRequest = useCallback(async (method, path, body) => {
    if (!THEO_LIVE_API_TOKEN) {
      const message = "VITE_THEO_LIVE_API_TOKEN is required for API actions.";
      log("Configuration error", message);
      return { error: message };
    }

    const host = configRef.current.adsHost.trim();
    const url = `https://${host}${path}`;

    log("Request", {
      method,
      url,
      body,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "theo-live-api-token": THEO_LIVE_API_TOKEN ? "[REDACTED]" : undefined,
      },
    });

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "theo-live-api-token": THEO_LIVE_API_TOKEN,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    let data;
    try {
      data = await response.json();
    } catch (error) {
      data = await response.text();
    }

    log("Response", { status: response.status, ok: response.ok, data });
    return data;
  }, [log]);

  const setupCountdown = useCallback((which, startTime, layout, totalSeconds) => {
    if (!startTime) return;

    if (countdownTimersRef.current[which]) {
      clearInterval(countdownTimersRef.current[which]);
      countdownTimersRef.current[which] = null;
    }

    const totalMs = Math.max(totalSeconds * 1000, 1);
    const update = () => {
      const diff = startTime.getTime() - Date.now();
      const remainingSeconds = Math.max(Math.ceil(diff / 1000), 0);
      const progress = Math.max(Math.min((diff / totalMs) * 100, 100), 0);

      setCountdowns((previous) => ({
        ...previous,
        [which]: { layout, remainingSeconds, progress },
      }));

      if (diff <= 0) {
        log(`Player ${which}`, "Ad break start time reached.");
        clearInterval(countdownTimersRef.current[which]);
        countdownTimersRef.current[which] = null;
        window.setTimeout(() => {
          setCountdowns((previous) => ({ ...previous, [which]: null }));
        }, 1200);
      }
    };

    update();
    countdownTimersRef.current[which] = setInterval(update, 250);
  }, [log]);

  const scheduleBreak = useCallback((which, layoutOverride, startDelaySeconds) => {
    const sourceConfig = configRef.current;
    const streamId = getStreamId(which, sourceConfig);
    const layout = layoutOverride || sourceConfig.layout || "SINGLE";
    const duration = parseInt(sourceConfig.breakDuration, 10) || 15;
    const startTime = new Date(Date.now() + startDelaySeconds * 1000);
    const body = {
      id: `ad-${which}-${Date.now()}`,
      startDate: startTime.toISOString(),
      duration,
      layout,
    };

    const adPlaylist = sourceConfig.adPlaylistUrl.trim();
    if (adPlaylist) {
      body.assetURI = adPlaylist;
    }

    log("Schedule break", { which, streamId, body });
    setupCountdown(which, startTime, layout, startDelaySeconds);

    return apiRequest(
      "POST",
      `/ads-client/api/v1/monetized-streams/${streamId}/break`,
      body
    );
  }, [apiRequest, getStreamId, log, setupCountdown]);

  const createStreams = useCallback(() => {
    const sourceConfig = configRef.current;
    const networkCode = sourceConfig.networkCode.trim();
    const origin = sourceConfig.originUrl.trim();
    const segmentOrigin = sourceConfig.segOrigin.trim();
    const layout = sourceConfig.layout || "SINGLE";
    const backdropUriValue = sourceConfig.backdropUri.trim();
    let extraFields = null;

    const raw = sourceConfig.extraFieldsJson.trim();
    if (raw) {
      try {
        extraFields = JSON.parse(raw);
        if (typeof extraFields !== "object" || Array.isArray(extraFields)) {
          log("Extra fields JSON error", "Root value must be an object; ignoring extraFields.");
          extraFields = null;
        }
      } catch (error) {
        log("Extra fields JSON parse error", String(error));
        extraFields = null;
      }
    }

    const createFor = (which) => {
      const body = {
        streamId: getStreamId(which, sourceConfig),
        networkCode,
        assetKey: getAssetKey(which, sourceConfig),
      };

      if (sourceConfig.includeLayout && layout) body.layout = layout;
      if (sourceConfig.includeOrigin && origin) body.origin = origin;
      if (sourceConfig.includeSegmentOrigin && segmentOrigin) body.segmentOrigin = segmentOrigin;
      if (sourceConfig.includeBackdrop && backdropUriValue) body.backdropURI = backdropUriValue;
      if (extraFields) Object.assign(body, extraFields);

      log("Create Monetized Stream body", { which, body });
      return apiRequest("POST", "/ads-client/api/v1/monetized-streams", body);
    };

    return Promise.all([createFor(1), createFor(2)])
      .then(() => {
        setPlayerSource(player1Ref.current, 1);
        setPlayerSource(player2Ref.current, 2);
      })
      .catch((error) => log("Create stream error", String(error)));
  }, [apiRequest, getAssetKey, getStreamId, log, setPlayerSource]);

  const applyPlayerSources = useCallback(() => {
    setPlayerSource(player1Ref.current, 1);
    setPlayerSource(player2Ref.current, 2);
  }, [setPlayerSource]);

  const listStreams = useCallback(() => {
    return apiRequest("GET", "/ads-client/api/v1/monetized-streams");
  }, [apiRequest]);

  const listBreaks = useCallback(() => {
    const s1 = getStreamId(1);
    const s2 = getStreamId(2);
    return Promise.all([
      apiRequest("GET", `/ads-client/api/v1/monetized-streams/${s1}/breaks`),
      apiRequest("GET", `/ads-client/api/v1/monetized-streams/${s2}/breaks`),
    ]);
  }, [apiRequest, getStreamId]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      const ms = String(now.getMilliseconds()).padStart(3, "0");
      setCurrentTime(`${hours}:${minutes}:${seconds}.${ms}`);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    createPlayer(1);
    createPlayer(2);

    return () => {
      if (playerRecreateTimerRef.current) {
        window.clearTimeout(playerRecreateTimerRef.current);
      }
      destroyPlayer(1);
      destroyPlayer(2);
      Object.values(countdownTimersRef.current).forEach((timer) => {
        if (timer) clearInterval(timer);
      });
    };
  }, [createPlayer, destroyPlayer]);

  const templateOptions = useMemo(() => Object.entries(TEMPLATES), []);

  return (
    <main className="flex h-full flex-col gap-4 bg-muted/40 p-6 text-foreground">
      <header className="relative flex flex-none items-center justify-between gap-4">
        <img src="/DLB_OV_horz_rgb_wht.png" alt="OptiView Logo" className="h-8 invert" />
        <div className="absolute left-1/2 -translate-x-1/2 text-xs text-muted-foreground">
          <span className="mr-1 uppercase tracking-wide">Current time:</span>
          <span id="currentTime" className="font-mono text-sm text-foreground">{currentTime}</span>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="templateSelect" className="text-xs text-muted-foreground">Template</Label>
          <Select
            id="templateSelect"
            value={config.template}
            onChange={(event) => applyTemplate(event.target.value)}
            className="h-8 w-56 text-xs"
          >
            {templateOptions.map(([key, template]) => (
              <option key={key} value={key}>{template.label}</option>
            ))}
          </Select>
        </div>
      </header>

      <Card className="flex-none overflow-hidden shadow-sm">
        <details>
          <summary className="flex cursor-pointer select-none items-center justify-between gap-3 px-4 py-3 text-lg font-semibold">
            <span>Configuration &amp; API Actions</span>
            <span className="flex items-center gap-1 text-xs font-normal text-muted-foreground">
              Expand / collapse <ChevronDown className="h-4 w-4" />
            </span>
          </summary>
          <CardContent className="grid max-h-[30vh] grid-cols-1 gap-4 overflow-auto p-4 pt-0 lg:grid-cols-[minmax(0,2fr)_minmax(360px,1fr)]">
            <Card className="border-border/80 bg-muted/30 shadow-none">
              <CardHeader className="p-4 pb-3">
                <CardTitle className="text-lg">Configuration</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-3 p-4 pt-0 md:grid-cols-2 xl:grid-cols-3">
                <Field id="adsHost" label="OptiView Ads Host" value={config.adsHost} onChange={(value) => setConfigField("adsHost", value)} />
                <Field id="streamId1" label="Monetized Stream ID (Player 1)" value={config.streamId1} onChange={(value) => setConfigField("streamId1", value)} canIncrement />
                <Field id="streamId2" label="Monetized Stream ID (Player 2)" value={config.streamId2} onChange={(value) => setConfigField("streamId2", value)} canIncrement />
                <Field id="manifestPath" label="Manifest Path (HLS)" value={config.manifestPath} onChange={(value) => setConfigField("manifestPath", value)} />
                <Field id="networkCode" label="Network Code" value={config.networkCode} onChange={(value) => setConfigField("networkCode", value)} />
                <Field id="assetKey1" label="Custom Asset Key (Player 1)" value={config.assetKey1} onChange={(value) => setConfigField("assetKey1", value)} canIncrement />
                <Field id="assetKey2" label="Custom Asset Key (Player 2)" value={config.assetKey2} onChange={(value) => setConfigField("assetKey2", value)} canIncrement />
                <Field id="adUnit1" label="Ad Unit (Player 1)" value={config.adUnit1} placeholder="optional, e.g. demo/adunit1" onChange={(value) => setConfigField("adUnit1", value)} canIncrement />
                <Field id="adUnit2" label="Ad Unit (Player 2)" value={config.adUnit2} placeholder="optional, e.g. demo/adunit2" onChange={(value) => setConfigField("adUnit2", value)} canIncrement />
                <div className="space-y-1.5">
                  <Label htmlFor="layout">Default Layout</Label>
                  <Select id="layout" value={config.layout} onChange={(event) => setConfigField("layout", event.target.value)}>
                    <option value="">SINGLE (default)</option>
                    <option value="SINGLE">SINGLE</option>
                    <option value="DOUBLE">DOUBLE</option>
                    <option value="LSHAPE_AD">LSHAPE_AD</option>
                    <option value="LSHAPE_CONTENT">LSHAPE_CONTENT</option>
                  </Select>
                </div>
                <Field id="originUrl" label="Origin URL" value={config.originUrl} onChange={(value) => setConfigField("originUrl", value)} />
                <Field id="segOrigin" label="Segment Origin" value={config.segOrigin} onChange={(value) => setConfigField("segOrigin", value)} />
                <Field id="adPlaylistUrl" label="Ad Playlist URL" value={config.adPlaylistUrl} onChange={(value) => setConfigField("adPlaylistUrl", value)} />
                <Field id="breakDuration" label="Break Duration (seconds)" type="number" value={config.breakDuration} onChange={(value) => setConfigField("breakDuration", value)} />
                <Field id="backdropUri" label="Backdrop URI" value={config.backdropUri} onChange={(value) => setConfigField("backdropUri", value)} />
                <div className="space-y-1.5 md:col-span-2 xl:col-span-3">
                  <Label htmlFor="extraFieldsJson">Extra request fields (JSON)</Label>
                  <Textarea
                    id="extraFieldsJson"
                    value={config.extraFieldsJson}
                    onChange={(event) => setConfigField("extraFieldsJson", event.target.value)}
                    placeholder='{"foo":"bar","backdropURI":"https://example.com/backdrop.png"}'
                    className="min-h-[72px] font-mono text-xs"
                  />
                </div>
                <div className="grid gap-2 text-xs text-muted-foreground md:col-span-2 xl:col-span-3">
                  <Label className="flex items-center gap-2"><Checkbox checked={config.includeLayout} onChange={(event) => setConfigField("includeLayout", event.target.checked)} /> Include layout</Label>
                  <Label className="flex items-center gap-2"><Checkbox checked={config.includeOrigin} onChange={(event) => setConfigField("includeOrigin", event.target.checked)} /> Include origin</Label>
                  <Label className="flex items-center gap-2"><Checkbox checked={config.includeSegmentOrigin} onChange={(event) => setConfigField("includeSegmentOrigin", event.target.checked)} /> Include segmentOrigin</Label>
                  <Label className="flex items-center gap-2"><Checkbox checked={config.includeBackdrop} onChange={(event) => setConfigField("includeBackdrop", event.target.checked)} /> Include backdropURI</Label>
                </div>
                <div className="grid gap-2 md:col-span-2 xl:col-span-3 md:grid-cols-2">
                  <Button onClick={createStreams}>Create Monetized Streams (P1 &amp; P2)</Button>
                  <Button variant="outline" onClick={applyPlayerSources}>Apply Player Sources</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/80 bg-muted/30 shadow-none">
              <CardHeader className="p-4 pb-3">
                <CardTitle className="text-lg">API Actions</CardTitle>
              </CardHeader>
              <CardContent className="flex min-h-[260px] flex-col gap-3 p-4 pt-0">
                <Button variant="outline" onClick={listStreams}>List Monetized Streams</Button>
                <Button onClick={() => scheduleBreak(1, null, 1)}>Schedule Immediate Break on P1 (0s offset)</Button>
                <Button variant="outline" onClick={listBreaks}>List Scheduled Breaks (P1 &amp; P2)</Button>
                <div className="mt-1 flex min-h-0 flex-1 flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Debug Log</h3>
                    <Button variant="outline" size="sm" onClick={() => setLogText("")}>Clear</Button>
                  </div>
                  <pre id="log" className="min-h-24 flex-1 overflow-auto rounded-md border bg-background p-3 text-xs text-muted-foreground shadow-inner">{logText}</pre>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </details>
      </Card>

      <section className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
        <div className="grid min-h-0 grid-cols-1 items-start gap-4 overflow-auto lg:grid-cols-2">
          <PlayerCard
            title="Player 1 / OptiView Ads"
            status={status}
            containerRef={player1ContainerRef}
            onSchedule={(layout) => scheduleBreak(1, layout, 15)}
            countdown={countdowns[1]}
          />
          <PlayerCard
            title="Player 2 / OptiView Ads"
            containerRef={player2ContainerRef}
            onSchedule={(layout) => scheduleBreak(2, layout, 15)}
            countdown={countdowns[2]}
          />
        </div>
      </section>
    </main>
  );
}
