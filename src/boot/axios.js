import { boot } from "quasar/wrappers";
import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:8000/api" });
const storage = axios.create({ baseURL: "http://localhost:8000/storage" });

export default boot(({ app }) => {
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;
  app.config.globalProperties.$storage = storage;
});

export { api, storage };
