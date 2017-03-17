# Architecture
The code is divided into three main sections:
1. `electron` - Electron specific code.
2. `renderer` - Renderer specific code.
3. `shared`   - Code that is required by both `electron` and `renderer`.

Some notes...
Many functions can only be run one one process. For example, the database lookups can only happen in `electron` and the player related actions can only happen in the `renderer`. 
The `lib` object takes care of this by mapping these functions to the right process. For example, if you run `lib.player.play` in the electron thread it will actually send an RPC request over IPC to the renderer process.
This type of inter-process communication is described below:

### Communication

Museeks currently consists of two different threads/processes.
* Electron  - This is the electron main-thread which runs in the background.
* Renderer  - This is the renderer window.
This architecture leaves room for additional renderer threads to be added in the future such as a mini-player accessed from the tray icon.

#### API (Networked Museeks -> Electron || Renderer -> Electron)

A web-server runs in the Electron process. This is used to receive API commands from either the renderer or other instances of museeks running on the network. This API can be used to control Museeks remotely or return data.

#### RPC (Electron <-> Renderer)

RPC (Remote Procedure Call) is used to run function in any thread's `lib` object. The result will be returned to the calling thread as though it were a promise. These RPC requests are submitted through electron IPC (Inter Process Communication) system.
