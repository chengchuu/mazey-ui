import "bootstrap/dist/css/bootstrap.min.css";
import "./site.css";
import { initializeNavigation } from "./navigation";
import { initializePwa } from "./pwa";

export function initializeSharedSite() {
  initializeNavigation();
  initializePwa();
}
