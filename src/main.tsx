/*
|--------------------------------------------------------------------------
| React and Router
|--------------------------------------------------------------------------
*/

import React from "react";
import * as ReactDOM from "react-dom/client";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { RouterProvider } from "react-router-dom";
import { attachConsole } from "@tauri-apps/plugin-log";

import router from "./views/router";

/*
|--------------------------------------------------------------------------
| Styles
|--------------------------------------------------------------------------
*/
import "font-awesome/css/font-awesome.css";
import "normalize.css/normalize.css";
import "./styles/main.module.css";

/*
|--------------------------------------------------------------------------
| Render the app
|--------------------------------------------------------------------------
*/

attachConsole();

const wrap = document.getElementById("root");

if (wrap) {
  const root = ReactDOM.createRoot(wrap);
  root.render(
    <React.StrictMode>
      <DndProvider backend={HTML5Backend}>
        <RouterProvider router={router} />
      </DndProvider>
    </React.StrictMode>
  );
}
