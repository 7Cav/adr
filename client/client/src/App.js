import React, {useEffect, useState} from 'react';
import './App.css';

import WAGList from './modules/IMO/WAG.js'

/*class App extends Component{
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
}*/

function MilpacRequest () {

  const [milpacList, setMilpacList] = useState ([]);
  useEffect(() => {
      async function fetchMilpacList() {
          try {
              const requestUrl = 'http://localhost:4000/roster/combat'
              const response = await fetch (requestUrl);
              const responseJSON = await response.json();
              setMilpacList(responseJSON);
              // console.log(responseJSON);
          } catch {

          }
      } 
   fetchMilpacList();
  }/*, []*/);

  return(
    <div className='MasterContainer'>
      <div className='IMOContainer'>
        <div className='IMOTitle'><h1> Information Mananagment Office</h1></div>
        <WAGList milpacList={milpacList} />
      </div>
    </div> 
  )



}
export default MilpacRequest;
