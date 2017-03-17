# RPC (Remote Procedure Call)

## Why?
It is a real PITA to call functions running in another electron thread/process. 
This system lets you not only easily call a function running in a different thread but also get a response.
Ultimatley, this is a fancy promise wrapper for electron's build-in IPC system.

## Usage
The RPC system needs to be setup in every electron thread you which to communicate between. A typical example would be.

Main Electron Thread:
```javascript  
  import { RpcIpcManger, rpc } from 'rpc';
  
  // Specify the scope (this should be unique)
  const scope = 'electron';
  
  // Create the function lib
  const library = {
    ping = (inputs) => {
      console.log('ping ' + inputs)
      return 'pong from electron'
    }
  }
  
  const rpcIpcManager = new RpcIpcManger(library, scope);
    
```

Renderer Thread:
```javascript  
  import { RpcIpcManger } from 'rpc';
  
  / Specify the scope (this should be unique)
  const scope = 'renderer1';
  
  // Create the function lib
  const library = {}
  
  const rpcIpcManager = new RpcIpcManger(library, scope);
  
  // We send an RPC event from renderer -> electron
  rpc('electron', 'ping', 'from renderer').then(console.log)
  
```

Result:
Electron logs out:
`ping from renderer`
Renderer logs outs:
`pong from electron`
