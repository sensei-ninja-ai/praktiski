import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setStillImageFormat("png");
Config.setCodec("h264");
Config.setJpegQuality(80);
Config.setDelayRenderTimeoutInMilliseconds(30000);