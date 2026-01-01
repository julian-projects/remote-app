const ws = new WebSocket('ws://localhost:8585/ws');

ws.onopen = () => {
  ws.send(JSON.stringify({
    event: 'command',
    data: { command: 'pwd' }
  }));
};

ws.onmessage = (event) => {
  console.log('Response:', JSON.parse(event.data));
};