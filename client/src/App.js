import logo from './logo.svg';
import './App.css';
import { Component } from 'react';

class App extends Component{
  constructor(props) {
    super(props)
    this.state =  {apiResponse: ''}
  }

  callApi() {
    fetch('http://localhost:4000/roster/combat')
    .then(res => res.text())
    .then(res => this.setState ({apiResponse: res}))
    .catch(err => err);
  }

  componentDidMount () {
    this.callApi();
  }
  
  render() {
    return ( 
      <div class='App'>
        <h1 class='response'>{this.state.apiResponse}</h1>
      </div>
    );
  }
}


export default App;
