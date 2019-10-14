import React from 'react';
import figlet from 'figlet'
import font from 'figlet/importable-fonts/Fire Font-k'

import GameCanvas from './GameCanvas'
import headerImage from './main.jpg'
import './App.css';


class App extends React.Component {  
  ws = new WebSocket(`ws://${window.location.hostname}`)

  constructor(props){
    super(props)
    this.state = {
      error: false,
      ready: false,
      likes: {}
    }
  }

  componentDidMount(){
    figlet.parseFont('/Fire Font-k', font);
    figlet('CHEATER DETECTED', {font: '/Fire Font-k'},(err, data) => {
      if(err){
        return
      }
      console.log(data)
      console.log('Here at EdgarWars.com we have a very strict cheating policy and any attempt at cheating is therefore greatly encouraged.')
      console.log('As long as your Edgar wins...')
    })
    this.ws.onopen = () => {
      this.setState({ready: true})
    }

    this.ws.onclose = () => {
      this.setState({error: true})
    }

    this.ws.onmessage = evt => {
      const like = JSON.parse(evt.data)
      this.newLike(like)
    }
  }
 
  newLike = d => {
    this.setState({likes: d})
  } 

  mapClick = p => {
    this.ws.send(p)
  }

  render(){
    const {ready, error} = this.state
    const {likes} = this.state
    return (
      <div className="App">
        <div className="App-content">
        {error && 
        <div> WOOOOOOPS. Try to reload, if that doesn't work then you are fuuuuuucked.</div>
        }
        {ready && !error &&
        <React.Fragment>
          <img src={headerImage} className="App-logo" alt="logo" useMap="#image-map" />
          <map name="image-map">
            <area onClick={this.mapClick.bind(this, 'johan')} alt="Johan" title="Johan"coords="127,145,272,483" shape="rect"/>
            <area onClick={this.mapClick.bind(this, 'gill')} alt="Gill" title="Gill" coords="331,147,480,478" shape="rect"/>
            <area onClick={this.mapClick.bind(this, 'anders')} alt="Anders" title="Anders" coords="669,483,529,148" shape="rect"/>
            <area onClick={this.mapClick.bind(this, 'peter')} alt="Peter" title="Peter" coords="832,483,691,147" shape="rect"/>
          </map>
          <GameCanvas likes={likes}/>
        </React.Fragment>
        }
        </div>
      </div>
    );
  }
}

export default App;
