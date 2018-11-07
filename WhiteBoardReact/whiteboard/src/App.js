import React, { Component } from 'react';
import './App.css';
import * as signalR from '@aspnet/signalr';

class App extends Component  {
  constructor(props)
  {
    super(props);
    this.state = {
    last_mousex : 0,
    last_mousey : 0,
    mousex : 0,
    mousey : 0,
    mousedown : false,
    color : 'black',
    canvasx: 0,
    canvasy: 0
    }

    this.canvas = React.createRef();
  }

componentDidMount = () => {

  const protocol = new signalR.JsonHubProtocol();

  const transport = signalR.HttpTransportType.WebSockets;

  const options = {
    transport,
    logMessageContent: true,
    logger: signalR.LogLevel.Trace
  };

  // create the connection instance

  this.setState({
  connection : new signalR.HubConnectionBuilder()
    .withUrl('http://localhost:56726/draw', options)
    .withHubProtocol(protocol)
    .build()
  },()=>
  {    // start connection
    this.state.connection.start().catch(err => console.error(err, 'red'));

    this.state.connection.on('draw', this.drawCanvasClient);
  }  );

}

onMouseDown = (e) =>
{
  e.preventDefault();
  this.setState({
    last_mousex : parseInt(e.clientX - this.state.canvasx),
    mousex : parseInt(e.clientX - this.state.canvasx),
    last_mousey : parseInt(e.clientY - this.state.canvasy),
    mousey : parseInt(e.clientY - this.state.canvasy),
    mousedown : true,
  });
}

drawCanvasClient = (prev_x, prev_y, x, y, clr) =>
{
  this.drawCanvas(prev_x,prev_y,x,y,clr, this.canvas);
}

drawCanvas = (prev_x, prev_y, x, y, clr, cvn) =>
{
  console.log(prev_x);
  console.log(prev_y);
  console.log(clr);
  console.log(cvn);
  const ctx = cvn.getContext("2d");
  ctx.globalCompositeOperation = 'source-over';
  ctx.strokeStyle = clr;
  ctx.lineWidth = 3;
  ctx.moveTo(prev_x, prev_y);
  ctx.lineTo(x, y);
  ctx.lineJoin = ctx.lineCap = 'round';
  ctx.stroke();
}

clearMousePositions = () =>
{  this.setState({
    last_mousex : 0,
    last_mousey : 0
  });
}

onMouseUp = () =>
{  this.setState({
    mousedown: false
  });
}

onMouseMove = (e) =>
{
  this.setState({
    mousex : parseInt(e.clientX - this.state.canvasx),
    mousey : parseInt(e.clientY - this.state.canvasy)
  },
  () =>
    {
      if ((this.state.last_mousex > 0 && this.state.last_mousey > 0) && this.state.mousedown) {
        this.drawCanvas(this.state.mousex, this.state.mousey, this.state.last_mousex, this.state.last_mousey, this.state.color, this.canvas);
        this.state.connection.invoke('draw', this.state.last_mousex, this.state.last_mousey, this.state.mousex, this.state.mousey, this.state.color)
      }

    }
  );

  this.setState({
    last_mousex : this.state.mousex,
    last_mousey : this.state.mousey
  });
}

render() {

    return (
      <div>
      <canvas ref={(canvas) => this.canvas = canvas} id="canvas"
      onMouseMove = {this.onMouseMove}
      onMouseUp={this.onMouseUp} onMouseDown={this.onMouseDown}
      width="800" height="500" onMouseOut={this.clearMousePositions}>

      </canvas>
        <select id="color" onChange={(value)=> this.setState({color :value.target.value}) } >
          <option value="black">Black</option>
          <option value="red">Red</option>
          <option value="yellow">Yellow</option>
          <option value="green">Green</option>
          <option value="blue">Blue</option>
        </select>

      <div id="output">
      current: {this.state.mousex} ,  {this.state.mousey} <br/>last: {this.state.last_mousex},  {this.state.last_mousey}<br/>mousedown: {this.state.mousedown}
      </div>

      </div>
    );
  }
}

export default App;
