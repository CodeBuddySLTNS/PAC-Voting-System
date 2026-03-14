import axios from "axios";
import config from "../../system.config.json";

export const baseURL = window.origin.includes("https://")
  ? config.tunneledServer
  : config.localServer;

export const axiosInstance = axios.create({
  baseURL,
});

